"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterSuccessResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    [key: string]: unknown;
  };
  message?: string;
}

interface RegisterErrorResponse {
  message?: string;
  error?: string;
  msg?: string;
  errors?: { field: string; message: string }[]; // express-validator style
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Safe JSON parse — returns null if the body is not JSON (e.g. HTML 502 page) */
async function safeJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Persist auth data only in browser context (guards against Next.js SSR) */
function saveAuthData(token: string, user: RegisterSuccessResponse["user"]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const router = useRouter();

  // ── Client-side validation ──────────────────────────────────────────────

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    setGlobalError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      const payload: RegisterPayload = {
        name: fullName.trim(),          // ← "name" is the most common backend field
        email: email.trim().toLowerCase(),
        password,
      };

      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // ── Parse response ────────────────────────────────────────────────

      if (response.ok) {
        const res = await safeJson<{ success: boolean; data: Record<string, unknown> }>(response);

        if (!res) {
          router.push("/onboarding");
          return;
        }

        const payload = res?.data ?? {};
        const token = payload.token as string | undefined;
        if (token) {
          const { token: _t, ...user } = payload;
          void _t;
          saveAuthData(token, user as RegisterSuccessResponse["user"]);
        }

        router.push("/onboarding");
        return;
      }

      // ── Handle error responses ────────────────────────────────────────

      const errorData = await safeJson<RegisterErrorResponse>(response);

      // express-validator array errors → map to per-field errors
      if (errorData?.errors?.length) {
        const mapped: FieldErrors = {};
        for (const e of errorData.errors) {
          const f = e.field as keyof FieldErrors;
          if (f in { fullName: 1, email: 1, password: 1 }) mapped[f] = e.message;
        }
        setFieldErrors(mapped);
        return;
      }

      // Single error message from backend
      const serverMsg =
        errorData?.message ??
        errorData?.error ??
        errorData?.msg ??
        `Registration failed (${response.status})`;

      // Surface common status codes clearly
      if (response.status === 409)
        setGlobalError("An account with this email already exists. Please sign in.");
      else if (response.status === 422)
        setGlobalError("Please check your inputs and try again.");
      else if (response.status >= 500)
        setGlobalError("Server error. Please try again in a moment.");
      else
        setGlobalError(serverMsg);

    } catch (err: unknown) {
      // Network failure or JSON parse error
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Registration Error:", err);
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex w-full min-h-screen" style={{ fontFamily: "'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
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
          padding: 0 14px; font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #112920; background: #f9fbfa; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .tf-input:focus { border-color: #112920; background: white; box-shadow: 0 0 0 4px rgba(17,41,32,0.07); }
        .tf-input::placeholder { color: #a0b4ae; font-size: 13px; }
        .tf-input.error { border-color: #e74c3c; background: #fff8f8; }
        .tf-input.error:focus { box-shadow: 0 0 0 4px rgba(231,76,60,0.08); }
        .tf-input-pw { padding-right: 46px; }
        .tf-label { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #2d4a42; margin-bottom: 6px; letter-spacing: 0.01em; }
        .field-error { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #e74c3c; margin-top: 5px; }
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
        .btn-google {
          width: 100%; height: 50px; border-radius: 12px; background: white; color: #112920;
          font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px;
          border: 1.5px solid #dce6e2; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .btn-google:hover { border-color: #112920; background: #f3f7f5; box-shadow: 0 2px 12px rgba(17,41,32,0.08); }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #e8eeec; }
        .divider-text { font-size: 12px; color: #9ab0aa; font-family: 'DM Sans', sans-serif; }
        .logo-display { font-family: 'Playfair Display', serif; }
        .main-heading { font-family: 'Playfair Display', serif; }
        .global-error {
          background: #fff2f2; border: 1px solid #fcd0cc; border-radius: 10px;
          color: #c0392b; font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 12px 16px; margin: 16px 0; line-height: 1.5;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeUp 0.6s ease forwards; }
        .animate-in-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animate-in-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .animate-in-delay-3 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      {/* ── Left Panel ──────────────────────────────────────────────────────── */}
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

      {/* ── Right Panel ─────────────────────────────────────────────────────── */}
      <main style={{ background: "#fafcfb" }} className="flex justify-center items-center flex-1 min-h-screen px-6 py-12">
        <div style={{ width: "100%", maxWidth: 420 }}>

          <h1 className="logo-display text-xl font-bold mb-8 md:hidden" style={{ color: "#112920" }}>
            Talent<span style={{ color: "#E9BD55" }}>Flow</span>
          </h1>

          <div className="animate-in">
            <h2 className="main-heading" style={{ fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 6 }}>
              Get Started
            </h2>
            <p style={{ color: "#7a9a91", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Your pathway to hands-on experience in your chosen track.
            </p>
          </div>

          {/* Global error banner */}
          {globalError && (
            <div className="global-error" role="alert">
              {globalError}
            </div>
          )}

          <div className="animate-in animate-in-delay-2" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Full Name */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className={`tf-input${fieldErrors.fullName ? " error" : ""}`}
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors(p => ({ ...p, fullName: undefined }));
                }}
                autoComplete="name"
                disabled={loading}
              />
              {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                className={`tf-input${fieldErrors.email ? " error" : ""}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }));
                }}
                autoComplete="email"
                disabled={loading}
              />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="password">Create a Password</label>
              <div className="pw-wrap">
                <input
                  id="password"
                  className={`tf-input tf-input-pw${fieldErrors.password ? " error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }));
                  }}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>

          </div>

          <div className="animate-in animate-in-delay-3" style={{ marginTop: 28 }}>
            <button
              className="btn-primary"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#7a9a91", margin: "14px 0" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#E9BD55", fontWeight: 500, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or continue with</span>
              <div className="divider-line" />
            </div>

            <button className="btn-google" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}