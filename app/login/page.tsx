"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/api";

interface LoginPayload { email: string; password: string; }
interface AuthSuccessResponse {
  success?: boolean;
  token: string;
  data?: { id: string; name: string; email: string; role?: string; track?: string; internId?: string;[key: string]: unknown };
  user?: { id: string; name: string; email: string; role?: string; track?: string;[key: string]: unknown };
  message?: string;
}
interface LoginErrorResponse { message?: string; error?: string; msg?: string; }
interface FieldErrors { email?: string; password?: string; }

async function safeJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try { return (await res.json()) as T; } catch { return null; }
}

function saveAuthData(token: string, user: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: LoginPayload = { email: email.trim().toLowerCase(), password };
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const res = await safeJson<{ success: boolean; data: Record<string, unknown> }>(response);
        const payload = res?.data ?? {};
        const token = payload.token as string | undefined;
        if (token) {
          const { token: _t, ...user } = payload;
          void _t;
          saveAuthData(token, user);
        }
        router.push("/dashboard");
        return;
      }
      const errorData = await safeJson<LoginErrorResponse>(response);
      const serverMsg = errorData?.message ?? errorData?.error ?? errorData?.msg ?? `Login failed (${response.status})`;
      if (response.status === 401) setGlobalError("Incorrect email or password. Please try again.");
      else if (response.status === 404) setGlobalError("No account found with this email. Please sign up.");
      else if (response.status === 429) setGlobalError("Too many attempts. Please wait a moment and try again.");
      else if (response.status >= 500) setGlobalError("Server error. Please try again in a moment.");
      else setGlobalError(serverMsg);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGlobalError(null);
    setGoogleLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGlobalError("Google login is not configured. Please contact support.");
      setGoogleLoading(false);
      return;
    }
    const google = (window as any).google;
    if (!google) {
      setGlobalError("Google SDK failed to load. Please refresh and try again.");
      setGoogleLoading(false);
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (googleResponse: { credential: string }) => {
        try {
          const res = await fetch(`${BASE_URL}/api/auth/google-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: googleResponse.credential }),
          });
          if (res.ok) {
            const data = await safeJson<AuthSuccessResponse>(res);
            if (data?.token) {
              const user = data.data ?? data.user ?? {};
              saveAuthData(data.token, user as Record<string, unknown>);
            }
            router.push("/dashboard");
            return;
          }
          const errorData = await safeJson<LoginErrorResponse>(res);
          const serverMsg = errorData?.message ?? errorData?.error ?? errorData?.msg;
          if (res.status === 403) setGlobalError("This Google account is not authorised. Please contact support.");
          else if (res.status >= 500) setGlobalError("Server error. Please try again in a moment.");
          else setGlobalError(serverMsg ?? "Google sign-in failed. Please try again.");
        } catch (err: unknown) {
          setGlobalError(err instanceof Error ? err.message : "Network error. Please try again.");
        } finally {
          setGoogleLoading(false);
        }
      },
    });
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) setGoogleLoading(false);
    });
  };

  return (
    <div className="flex w-full min-h-screen">
      <style>{`
        * { box-sizing: border-box; }
        .aside-panel { background: #112920; position: relative; overflow: hidden; }
        .aside-panel::before { content: ''; position: absolute; top: -120px; right: -120px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(233,189,85,0.12) 0%, transparent 70%); pointer-events: none; }
        .aside-panel::after { content: ''; position: absolute; bottom: -80px; left: -80px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(233,189,85,0.07) 0%, transparent 70%); pointer-events: none; }
        .gold-line { width: 48px; height: 3px; background: #E9BD55; border-radius: 2px; margin-bottom: 24px; }
        .stat-card { background: rgba(233,189,85,0.08); border: 1px solid rgba(233,189,85,0.2); border-radius: 12px; padding: 16px 24px; display: flex; flex-direction: column; gap: 2px; transition: background 0.3s; }
        .stat-card:hover { background: rgba(233,189,85,0.14); }
        .tf-input-wrap { position: relative; width: 100%; }
        .tf-input { width: 100%; height: 50px; border: 1.5px solid #dce6e2; border-radius: 10px; padding: 0 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #112920; background: #f9fbfa; outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
        .tf-input:focus { border-color: #112920; background: white; box-shadow: 0 0 0 4px rgba(17,41,32,0.07); }
        .tf-input::placeholder { color: #a0b4ae; font-size: 13px; }
        .tf-input.error { border-color: #e74c3c; background: #fff8f8; }
        .tf-input.error:focus { box-shadow: 0 0 0 4px rgba(231,76,60,0.08); }
        .tf-input-password { padding-right: 46px; }
        .tf-label { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #2d4a42; margin-bottom: 6px; letter-spacing: 0.01em; }
        .field-error { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #e74c3c; margin-top: 5px; }
        .toggle-pw { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #7a9a91; font-size: 14px; padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .toggle-pw:hover { color: #112920; }
        .btn-primary { width: 100%; height: 50px; border-radius: 12px; background: #112920; color: white; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px; border: none; cursor: pointer; letter-spacing: 0.02em; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; position: relative; overflow: hidden; }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(233,189,85,0.12) 0%, transparent 60%); opacity: 0; transition: opacity 0.2s; }
        .btn-primary:not(:disabled):hover { background: #1a3d2e; box-shadow: 0 6px 24px rgba(17,41,32,0.28); transform: translateY(-1px); }
        .btn-primary:not(:disabled):hover::after { opacity: 1; }
        .btn-primary:not(:disabled):active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .btn-google { width: 100%; height: 50px; border-radius: 12px; background: white; color: #112920; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px; border: 1.5px solid #dce6e2; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .btn-google:not(:disabled):hover { border-color: #112920; background: #f3f7f5; box-shadow: 0 2px 12px rgba(17,41,32,0.08); }
        .btn-google:disabled { opacity: 0.65; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid #dce6e2; border-top-color: #112920; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #e8eeec; }
        .divider-text { font-size: 12px; color: #9ab0aa; font-family: 'DM Sans', sans-serif; }
        .logo-display { font-family: 'Playfair Display', serif; }
        .main-heading { font-family: 'Playfair Display', serif; }
        .global-error { background: #fff2f2; border: 1px solid #fcd0cc; border-radius: 10px; color: #c0392b; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 12px 16px; margin-bottom: 20px; line-height: 1.5; }
        .forgot-link { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #E9BD55; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .forgot-link:hover { color: #c9992e; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeUp 0.6s ease forwards; }
        .animate-in-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animate-in-delay-2 { animation-delay: 0.2s; opacity: 0; }
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
          <div className="animate-in" style={{ marginBottom: 32 }}>
            <h2 className="main-heading" style={{ fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 6 }}>Welcome Back</h2>
            <p style={{ color: "#7a9a91", fontSize: 14, lineHeight: 1.6 }}>Sign in to continue your learning journey.</p>
          </div>
          {globalError && <div className="global-error" role="alert">{globalError}</div>}
          <form onSubmit={handleSubmit} noValidate className="animate-in animate-in-delay-1" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="tf-label" htmlFor="email">Email Address</label>
              <input id="email" className={`tf-input${fieldErrors.email ? " error" : ""}`} type="email" placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined })); }}
                autoComplete="email" disabled={loading || googleLoading} />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="tf-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgotten-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="tf-input-wrap">
                <input id="password" className={`tf-input tf-input-password${fieldErrors.password ? " error" : ""}`}
                  type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined })); }}
                  autoComplete="current-password" disabled={loading || googleLoading} />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} tabIndex={-1}>
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>
            <div className="animate-in animate-in-delay-2" style={{ marginTop: 10 }}>
              <button type="submit" className="btn-primary" disabled={loading || googleLoading}>
                {loading ? "Signing In…" : "Sign In"}
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "#7a9a91", margin: "14px 0" }}>
                Don&apos;t have an account?{" "}
                <Link href="/register" style={{ color: "#E9BD55", fontWeight: 500, textDecoration: "none" }}>Sign up</Link>
              </p>
              <div className="divider"><div className="divider-line" /><span className="divider-text">or continue with</span><div className="divider-line" /></div>
              <button type="button" className="btn-google" onClick={handleGoogleLogin} disabled={loading || googleLoading} aria-label="Continue with Google">
                {googleLoading ? (
                  <><span className="spinner" />Connecting…</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}