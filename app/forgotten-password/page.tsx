"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiErrorResponse {
  message?: string;
  error?: string;
  msg?: string;
}

interface FieldErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function safeJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch with a timeout. Throws a named "TimeoutError" if the request
 * takes longer than `ms` milliseconds so the UI never hangs forever.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  ms = 15_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RecoverPassword() {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const router = useRouter();

  // ── OTP input handlers ───────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (fieldErrors.otp) setFieldErrors(p => ({ ...p, otp: undefined }));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...otp];
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setOtp(updated);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Stage 1 — Send recovery email ────────────────────────────────────────

  const handleSendRecoveryEmail = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!email.trim()) {
      setFieldErrors({ email: "Email address is required." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: "Enter a valid email address." });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      console.log("[TalentFlow] POST forgot-password →", `${BASE_URL}/api/auth/forgot-password`);

      const response = await fetchWithTimeout(
        `${BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        },
        15_000 // 15 second timeout
      );

      console.log("[TalentFlow] Response status:", response.status);

      if (response.ok) {
        console.log("[TalentFlow] Success — moving to stage 2");
        setSuccessMessage("Recovery code sent! Check your inbox.");
        setLoading(false); // set before setStage so button doesn't flash
        setStage(2);
        return;
      }

      // Non-2xx — parse error body
      const errorData = await safeJson<ApiErrorResponse>(response);
      console.log("[TalentFlow] Error body:", errorData);

      const serverMsg = errorData?.message ?? errorData?.error ?? errorData?.msg;

      if (response.status === 404)
        setGlobalError("No account found with this email address.");
      else if (response.status === 429)
        setGlobalError("Too many attempts. Please wait before requesting another code.");
      else if (response.status >= 500)
        setGlobalError("Server error. Please try again in a moment.");
      else
        setGlobalError(serverMsg ?? `Request failed (${response.status})`);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error. Please try again.";
      console.error("[TalentFlow] Fetch error:", err);
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Stage 2 — Verify OTP ─────────────────────────────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setFieldErrors({ otp: "Please enter the complete 6-digit code." });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      console.log("[TalentFlow] POST verify-otp");

      const response = await fetchWithTimeout(
        `${BASE_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), otp: fullOtp }),
        },
        15_000
      );

      console.log("[TalentFlow] verify-otp status:", response.status);

      if (response.ok) {
        setSuccessMessage("Code verified! Set your new password.");
        setLoading(false);
        setStage(3);
        return;
      }

      const errorData = await safeJson<ApiErrorResponse>(response);
      const serverMsg = errorData?.message ?? errorData?.error ?? errorData?.msg;

      if (response.status === 400)
        setGlobalError("Invalid or expired code. Please request a new one.");
      else if (response.status === 429)
        setGlobalError("Too many attempts. Please request a new code.");
      else if (response.status >= 500)
        setGlobalError("Server error. Please try again in a moment.");
      else
        setGlobalError(serverMsg ?? `Verification failed (${response.status})`);

    } catch (err: unknown) {
      console.error("[TalentFlow] verify-otp error:", err);
      setGlobalError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Stage 3 — Reset password ──────────────────────────────────────────────

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);

    const errors: FieldErrors = {};
    if (!newPassword)
      errors.newPassword = "New password is required.";
    else if (newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword)
      errors.confirmPassword = "Please confirm your new password.";
    else if (newPassword !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      console.log("[TalentFlow] POST reset-password");

      const response = await fetchWithTimeout(
        `${BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.join(""),
            newPassword,
          }),
        },
        15_000
      );

      console.log("[TalentFlow] reset-password status:", response.status);

      if (response.ok) {
        setSuccessMessage("Password reset successfully! Redirecting to login…");
        setLoading(false);
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      const errorData = await safeJson<ApiErrorResponse>(response);
      const serverMsg = errorData?.message ?? errorData?.error ?? errorData?.msg;

      if (response.status === 400)
        setGlobalError("Reset session expired. Please start over.");
      else if (response.status >= 500)
        setGlobalError("Server error. Please try again in a moment.");
      else
        setGlobalError(serverMsg ?? `Reset failed (${response.status})`);

    } catch (err: unknown) {
      console.error("[TalentFlow] reset-password error:", err);
      setGlobalError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .aside-panel { background: #112920; position: relative; overflow: hidden; }
    .aside-panel::before {
      content: ''; position: absolute; top: -120px; right: -120px;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(233,189,85,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .aside-panel::after {
      content: ''; position: absolute; bottom: -80px; left: -80px;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(233,189,85,0.07) 0%, transparent 70%);
      pointer-events: none;
    }
    .gold-line { width: 48px; height: 3px; background: #E9BD55; border-radius: 2px; margin-bottom: 24px; }
    .stat-card {
      background: rgba(233,189,85,0.08); border: 1px solid rgba(233,189,85,0.2);
      border-radius: 12px; padding: 16px 24px;
      display: flex; flex-direction: column; gap: 2px; transition: background 0.3s;
    }
    .stat-card:hover { background: rgba(233,189,85,0.14); }
    .tf-input {
      width: 100%; height: 50px; border: 1.5px solid #dce6e2; border-radius: 10px;
      padding: 0 14px; font-family: 'DM Sans', sans-serif;
      font-size: 14px; color: #112920; background: #f9fbfa; outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .tf-input:focus { border-color: #112920; background: white; box-shadow: 0 0 0 4px rgba(17,41,32,0.07); }
    .tf-input::placeholder { color: #a0b4ae; font-size: 13px; }
    .tf-input.error { border-color: #e74c3c; background: #fff8f8; }
    .tf-input.error:focus { box-shadow: 0 0 0 4px rgba(231,76,60,0.08); }
    .tf-input-pw { padding-right: 46px; }
    .tf-label {
      font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
      color: #2d4a42; margin-bottom: 6px; letter-spacing: 0.01em; display: block;
    }
    .field-error { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #e74c3c; margin-top: 5px; }
    .global-error {
      background: #fff2f2; border: 1px solid #fcd0cc; border-radius: 10px;
      color: #c0392b; font-family: 'DM Sans', sans-serif; font-size: 13px;
      padding: 12px 16px; margin-bottom: 20px; line-height: 1.5;
    }
    .global-success {
      background: #f0faf4; border: 1px solid #a8dfc0; border-radius: 10px;
      color: #1a6b3c; font-family: 'DM Sans', sans-serif; font-size: 13px;
      padding: 12px 16px; margin-bottom: 20px; line-height: 1.5;
    }
    .pw-wrap { position: relative; width: 100%; }
    .toggle-pw {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #7a9a91;
      font-size: 14px; padding: 0; display: flex; align-items: center; transition: color 0.2s;
    }
    .toggle-pw:hover { color: #112920; }
    .btn-primary {
      width: 100%; height: 50px; border-radius: 12px; background: #112920; color: white;
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px; border: none;
      cursor: pointer; letter-spacing: 0.02em;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(233,189,85,0.12) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.2s;
    }
    .btn-primary:not(:disabled):hover { background: #1a3d2e; box-shadow: 0 6px 24px rgba(17,41,32,0.28); transform: translateY(-1px); }
    .btn-primary:not(:disabled):hover::after { opacity: 1; }
    .btn-primary:not(:disabled):active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
    .btn-back {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      height: 50px; padding: 0 24px; border-radius: 12px;
      background: transparent; color: #112920; font-family: 'DM Sans', sans-serif;
      font-weight: 500; font-size: 15px; border: 1.5px solid #dce6e2;
      cursor: pointer; text-decoration: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .btn-back:hover { border-color: #112920; background: #f3f7f5; box-shadow: 0 2px 12px rgba(17,41,32,0.08); }
    .resend-btn {
      background: none; border: none; color: #E9BD55;
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
      cursor: pointer; padding: 0; transition: color 0.2s;
    }
    .resend-btn:hover { color: #d4a93d; }
    .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .otp-box {
      width: 56px; height: 60px; border-radius: 12px;
      border: 1.5px solid #dce6e2; background: #f9fbfa;
      color: #112920; font-family: 'DM Sans', sans-serif;
      font-size: 22px; font-weight: 600; text-align: center; outline: none;
      caret-color: #E9BD55;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .otp-box:focus { border-color: #112920; background: white; box-shadow: 0 0 0 4px rgba(17,41,32,0.07); }
    .otp-box.filled { border-color: #112920; background: white; }
    .otp-box.error { border-color: #e74c3c; background: #fff8f8; }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite; flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .logo-display { font-family: 'Playfair Display', serif; }
    .main-heading { font-family: 'Playfair Display', serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in { animation: fadeUp 0.5s ease forwards; }
    .animate-d1 { animation-delay: 0.08s; opacity: 0; }
    .animate-d2 { animation-delay: 0.16s; opacity: 0; }
  `;

  // ── Left panel ────────────────────────────────────────────────────────────

  const LeftPanel = () => (
    <aside className="aside-panel flex-1 p-10 min-h-screen hidden md:flex flex-col justify-between">
      <h1 className="logo-display text-white text-xl font-bold tracking-tight">
        Talent<span style={{ color: "#E9BD55" }}>Flow</span>
      </h1>
      <section style={{ color: "white", maxWidth: 400 }}>
        <div className="gold-line" />
        <h2 className="main-heading" style={{ fontSize: 40, lineHeight: 1.2, fontWeight: 700, color: "white", marginBottom: 20 }}>
          Where talent<br />meets <span style={{ color: "#E9BD55" }}>purpose.</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7, fontSize: 15, marginBottom: 40 }}>
          TalentFlow is a unified learning platform for Trueminds Innovation. Build real-world skills, collaborate with your cohort, and track your growth — all in one place.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <div className="stat-card">
            <span style={{ color: "#E9BD55", fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>50+</span>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Active Interns</span>
          </div>
          <div className="stat-card">
            <span style={{ color: "#E9BD55", fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>5+</span>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Learning Tracks</span>
          </div>
        </div>
      </section>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© 2025 TalentFlow · Trueminds Innovation</p>
    </aside>
  );

  // ── Stage 1 — Email ───────────────────────────────────────────────────────

  if (stage === 1) return (
    <div className="flex w-full min-h-screen">
      <style>{sharedStyles}</style>
      <LeftPanel />
      <main style={{ background: "#fafcfb" }} className="flex justify-center items-center flex-1 min-h-screen px-6 py-12">
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 className="logo-display text-xl font-bold mb-8 md:hidden" style={{ color: "#112920" }}>
            Talent<span style={{ color: "#E9BD55" }}>Flow</span>
          </h1>
          <div className="animate-in" style={{ marginBottom: 32 }}>
            <h2 className="main-heading" style={{ fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 8 }}>
              Recover Password
            </h2>
            <p style={{ color: "#7a9a91", fontSize: 14, lineHeight: 1.7 }}>
              Enter your registered email and we'll send a 6-digit recovery code.
            </p>
          </div>

          {globalError && <div className="global-error" role="alert">{globalError}</div>}
          {successMessage && <div className="global-success" role="status">{successMessage}</div>}

          <form onSubmit={handleSendRecoveryEmail} noValidate className="animate-in animate-d1" style={{ marginBottom: 24 }}>
            <label htmlFor="recover-email" className="tf-label">Email Address</label>
            <input
              id="recover-email"
              className={`tf-input${fieldErrors.email ? " error" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }));
                if (globalError) setGlobalError(null);
              }}
              autoComplete="email"
              disabled={loading}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            <button type="submit" className="btn-primary" style={{ marginTop: 24 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : "Send Recovery Code"}
            </button>
          </form>

          <div className="animate-in animate-d2" style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/login" className="btn-back">
              <i className="fa-solid fa-arrow-left" /> Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  // ── Stage 2 — OTP ─────────────────────────────────────────────────────────

  if (stage === 2) return (
    <div className="flex w-full min-h-screen">
      <style>{sharedStyles}</style>
      <LeftPanel />
      <main style={{ background: "#fafcfb" }} className="flex justify-center items-center flex-1 min-h-screen px-6 py-12">
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 className="logo-display text-xl font-bold mb-8 md:hidden" style={{ color: "#112920" }}>
            Talent<span style={{ color: "#E9BD55" }}>Flow</span>
          </h1>
          <div className="animate-in" style={{ marginBottom: 32 }}>
            <h2 className="main-heading" style={{ fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 8 }}>
              Verify Code
            </h2>
            <p style={{ color: "#7a9a91", fontSize: 14, lineHeight: 1.7 }}>
              We've sent a 6-digit code to{" "}
              <span style={{ fontWeight: 500, color: "#112920" }}>{email}</span>.
              Please enter it below.
            </p>
          </div>

          {globalError && <div className="global-error" role="alert">{globalError}</div>}
          {successMessage && <div className="global-success" role="status">{successMessage}</div>}

          <form onSubmit={handleVerifyOtp} noValidate className="animate-in animate-d1">
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: 6 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  ref={(el: HTMLInputElement | null) => { otpRefs.current[i] = el; }}
                  className={`otp-box${digit ? " filled" : ""}${fieldErrors.otp ? " error" : ""}`}
                  disabled={loading}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>
            {fieldErrors.otp && <p className="field-error" style={{ marginBottom: 16 }}>{fieldErrors.otp}</p>}

            <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Verifying…</> : "Verify Code"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <button
                type="button"
                className="resend-btn"
                onClick={() => handleSendRecoveryEmail()}
                disabled={loading}
              >
                Resend Code
              </button>
              <Link href="/login" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#7a9a91", textDecoration: "none" }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );

  // ── Stage 3 — Reset password ──────────────────────────────────────────────

  if (stage === 3) return (
    <div className="flex w-full min-h-screen">
      <style>{sharedStyles}</style>
      <LeftPanel />
      <main style={{ background: "#fafcfb" }} className="flex justify-center items-center flex-1 min-h-screen px-6 py-12">
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 className="logo-display text-xl font-bold mb-8 md:hidden" style={{ color: "#112920" }}>
            Talent<span style={{ color: "#E9BD55" }}>Flow</span>
          </h1>
          <div className="animate-in" style={{ marginBottom: 32 }}>
            <h2 className="main-heading" style={{ fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 8 }}>
              Reset Password
            </h2>
            <p style={{ color: "#7a9a91", fontSize: 14, lineHeight: 1.7 }}>
              Set your new password. Make sure it's strong and memorable.
            </p>
          </div>

          {globalError && <div className="global-error" role="alert">{globalError}</div>}
          {successMessage && <div className="global-success" role="status">{successMessage}</div>}

          <form onSubmit={handleResetPassword} noValidate className="animate-in animate-d1" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="new-password" className="tf-label">New Password</label>
              <div className="pw-wrap">
                <input
                  id="new-password"
                  className={`tf-input tf-input-pw${fieldErrors.newPassword ? " error" : ""}`}
                  type={showNew ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) setFieldErrors(p => ({ ...p, newPassword: undefined }));
                  }}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowNew(v => !v)} tabIndex={-1}
                  aria-label={showNew ? "Hide password" : "Show password"}>
                  <i className={`fa-solid ${showNew ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {fieldErrors.newPassword && <p className="field-error">{fieldErrors.newPassword}</p>}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="confirm-password" className="tf-label">Confirm New Password</label>
              <div className="pw-wrap">
                <input
                  id="confirm-password"
                  className={`tf-input tf-input-pw${fieldErrors.confirmPassword ? " error" : ""}`}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(p => ({ ...p, confirmPassword: undefined }));
                  }}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}>
                  <i className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Resetting…</> : "Reset Password"}
            </button>
          </form>

          <div className="animate-in animate-d2" style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <Link href="/login" className="btn-back">
              <i className="fa-solid fa-arrow-left" /> Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  return null;
}