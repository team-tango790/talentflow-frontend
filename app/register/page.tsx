"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/api";

interface RegisterPayload { name: string; email: string; password: string; }
interface RegisterSuccessResponse {
  token: string;
  user: { id: string; name: string; email: string; [key: string]: unknown };
}
interface RegisterErrorResponse {
  message?: string; error?: string; msg?: string;
  errors?: { field: string; message: string }[];
}
interface FieldErrors { fullName?: string; email?: string; password?: string; }

async function safeJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try { return (await res.json()) as T; } catch { return null; }
}

function saveAuthData(token: string, user: RegisterSuccessResponse["user"]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleRegister = async () => {
    setGlobalError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      };
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const res = await safeJson<{ success: boolean; data: Record<string, unknown> }>(response);
        if (!res) { router.push("/onboarding"); return; }
        const data = res?.data ?? {};
        const token = data.token as string | undefined;
        if (token) {
          const { token: _t, ...user } = data;
          void _t;
          saveAuthData(token, user as RegisterSuccessResponse["user"]);
        }
        router.push("/onboarding");
        return;
      }
      const errorData = await safeJson<RegisterErrorResponse>(response);
      if (errorData?.errors?.length) {
        const mapped: FieldErrors = {};
        for (const e of errorData.errors) {
          const f = e.field as keyof FieldErrors;
          if (f in { fullName: 1, email: 1, password: 1 }) mapped[f] = e.message;
        }
        setFieldErrors(mapped);
        return;
      }
      const serverMsg = errorData?.message ?? errorData?.error ?? errorData?.msg ?? `Registration failed (${response.status})`;
      if (response.status === 409) setGlobalError("An account with this email already exists. Please sign in.");
      else if (response.status === 422) setGlobalError("Please check your inputs and try again.");
      else if (response.status >= 500) setGlobalError("Server error. Please try again in a moment.");
      else setGlobalError(serverMsg);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .aside-panel { background: #112920; position: relative; overflow: hidden; }
        .aside-panel::before { content: ''; position: absolute; top: -120px; right: -120px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(233,189,85,0.12) 0%, transparent 70%); pointer-events: none; }
        .aside-panel::after { content: ''; position: absolute; bottom: -80px; left: -80px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(233,189,85,0.07) 0%, transparent 70%); pointer-events: none; }
        .gold-line { width: 48px; height: 3px; background: #E9BD55; border-radius: 2px; margin-bottom: 24px; }
        .stat-card { background: rgba(233,189,85,0.08); border: 1px solid rgba(233,189,85,0.2); border-radius: 12px; padding: 16px 24px; display: flex; flex-direction: column; gap: 2px; transition: background 0.3s; }
        .stat-card:hover { background: rgba(233,189,85,0.14); }
        .tf-input { width: 100%; height: 50px; border: 1.5px solid #dce6e2; border-radius: 10px; padding: 0 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #112920; background: #f9fbfa; outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
        .tf-input:focus { border-color: #112920; background: white; box-shadow: 0 0 0 4px rgba(17,41,32,0.07); }
        .tf-input::placeholder { color: #a0b4ae; font-size: 13px; }
        .tf-input.error { border-color: #e74c3c; background: #fff8f8; }
        .tf-input.error:focus { box-shadow: 0 0 0 4px rgba(231,76,60,0.08); }
        .tf-input-pw { padding-right: 46px; }
        .tf-label { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #2d4a42; margin-bottom: 6px; letter-spacing: 0.01em; }
        .field-error { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #e74c3c; margin-top: 5px; }
        .pw-wrap { position: relative; width: 100%; }
        .toggle-pw { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #7a9a91; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 0; transition: color 0.2s; }
        .toggle-pw:hover { color: #112920; }
        .btn-primary { width: 100%; height: 50px; border-radius: 12px; background: #112920; color: white; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px; border: none; cursor: pointer; letter-spacing: 0.02em; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; position: relative; overflow: hidden; }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(233,189,85,0.12) 0%, transparent 60%); opacity: 0; transition: opacity 0.2s; }
        .btn-primary:not(:disabled):hover { background: #1a3d2e; box-shadow: 0 6px 24px rgba(17,41,32,0.28); transform: translateY(-1px); }
        .btn-primary:not(:disabled):hover::after { opacity: 1; }
        .btn-primary:not(:disabled):active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .logo-display { font-family: 'Playfair Display', serif; }
        .main-heading { font-family: 'Playfair Display', serif; }
        .global-error { background: #fff2f2; border: 1px solid #fcd0cc; border-radius: 10px; color: #c0392b; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 12px 16px; margin: 16px 0; line-height: 1.5; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeUp 0.6s ease forwards; }
        .animate-in-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animate-in-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .animate-in-delay-3 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      {/* Left Panel */}
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
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© 2026 TalentFlow · Trueminds Innovation</p>
      </aside>

      {/* Right Panel */}
      <main style={{ background: "#fafcfb" }} className="flex justify-center items-center flex-1 min-h-screen px-6 py-12">
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 className="logo-display text-xl font-bold mb-8 md:hidden" style={{ color: "#112920" }}>
            Talent<span style={{ color: "#E9BD55" }}>Flow</span>
          </h1>
          <div className="animate-in">
            <h2 className="main-heading" style={{ fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 6 }}>Get Started</h2>
            <p style={{ color: "#7a9a91", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Your pathway to hands-on experience in your chosen track.
            </p>
          </div>
          {globalError && <div className="global-error" role="alert">{globalError}</div>}
          <div className="animate-in animate-in-delay-2" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="fullName">Full Name</label>
              <input id="fullName" className={`tf-input${fieldErrors.fullName ? " error" : ""}`} type="text" placeholder="John Doe" value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (fieldErrors.fullName) setFieldErrors(p => ({ ...p, fullName: undefined })); }}
                autoComplete="name" disabled={loading} />
              {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="email">Email Address</label>
              <input id="email" className={`tf-input${fieldErrors.email ? " error" : ""}`} type="email" placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined })); }}
                autoComplete="email" disabled={loading} />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="password">Create a Password</label>
              <div className="pw-wrap">
                <input id="password" className={`tf-input tf-input-pw${fieldErrors.password ? " error" : ""}`}
                  type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined })); }}
                  autoComplete="new-password" disabled={loading} />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} tabIndex={-1}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>
          </div>
          <div className="animate-in animate-in-delay-3" style={{ marginTop: 28 }}>
            <button className="btn-primary" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating Account…" : "Create Account"}
            </button>
            <p style={{ textAlign: "center", fontSize: 13, color: "#7a9a91", marginTop: 16 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#E9BD55", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}