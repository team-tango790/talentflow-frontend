"use client";
import { useState, useRef } from "react";
import Link from "next/link";

/* ── Types ── */
type Role = "learner" | "mentor";
type Track = string;

interface OnboardingData {
  role: Role | null;
  track: Track | null;
  email: string;
}

const TRACKS = [
  { id: "social-media", label: "Social media management", modules: 12, emoji: "📱" },
  { id: "backend", label: "Backend development", modules: 12, emoji: "💻" },
  { id: "project-mgmt", label: "Project management", modules: 12, emoji: "🌙" },
  { id: "frontend", label: "Frontend development", modules: 12, emoji: "🚀" },
  { id: "graphics", label: "Graphics design", modules: 12, emoji: "🎨" },
  { id: "uiux", label: "UI/UX design", modules: 12, emoji: "🎯" },
];

const INTERN_ID = "CAR  0123456789101";
const USER_NAME = "Aisha";

/* ════════════════════════════════════════════
   SHARED LAYOUT WRAPPER
════════════════════════════════════════════ */
function ScreenShell({
  children,
  onBack,
  onSkip,
}: {
  children: React.ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  return (
    <div
      style={{
        background: "#112920",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-up   { animation: fadeUp  0.55s ease forwards; }
        .anim-d1   { animation-delay: 0.08s; opacity: 0; }
        .anim-d2   { animation-delay: 0.16s; opacity: 0; }
        .anim-d3   { animation-delay: 0.24s; opacity: 0; }
        .anim-d4   { animation-delay: 0.32s; opacity: 0; }
        .anim-scale { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .btn-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.15);
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; transition: background 0.2s;
        }
        .btn-icon:hover { background: rgba(255,255,255,0.18); }

        .skip-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.7);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          transition: color 0.2s;
        }
        .skip-btn:hover { color: white; }

        .btn-gold {
          height: 52px; border-radius: 12px;
          background: #E9BD55; color: #112920;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 15px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .btn-gold:hover {
          background: #d4a93d;
          box-shadow: 0 6px 28px rgba(233,189,85,0.35);
          transform: translateY(-1px);
        }
        .btn-gold:active { transform: translateY(0); }

        /* Role cards */
        .role-card {
          flex: 1; border-radius: 16px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          padding: 32px 24px; cursor: pointer;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
        }
        .role-card:hover {
          border-color: rgba(233,189,85,0.5);
          background: rgba(233,189,85,0.05);
        }
        .role-card.selected {
          border-color: #E9BD55;
          background: rgba(233,189,85,0.08);
          box-shadow: 0 0 0 3px rgba(233,189,85,0.15);
        }

        /* Track cards */
        .track-card {
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          padding: 16px; cursor: pointer;
          display: flex; align-items: center; gap: 14px;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .track-card:hover {
          border-color: rgba(233,189,85,0.4);
          background: rgba(233,189,85,0.05);
        }
        .track-card.selected {
          border-color: #E9BD55;
          background: rgba(233,189,85,0.08);
          box-shadow: 0 0 0 3px rgba(233,189,85,0.12);
        }

        /* OTP */
        .otp-box {
          width: 56px; height: 60px; border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 22px; font-weight: 600;
          text-align: center; outline: none;
          caret-color: #E9BD55;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .otp-box:focus {
          border-color: #E9BD55;
          background: rgba(233,189,85,0.10);
          box-shadow: 0 0 0 4px rgba(233,189,85,0.12);
        }
        .otp-box.filled {
          border-color: rgba(233,189,85,0.5);
          background: rgba(233,189,85,0.08);
        }

        /* Profile summary table */
        .profile-table {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
          width: 100%; max-width: 420px;
        }
        .profile-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: 'DM Sans', sans-serif;
        }
        .profile-row:last-child { border-bottom: none; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px" }}>
        <button className="btn-icon" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="skip-btn" onClick={onSkip}>
          Skip
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px 48px" }}>
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   STEP LABEL
════════════════════════════════════════════ */
function StepLabel({ current, total }: { current: number; total: number }) {
  return (
    <p style={{ color: "#E9BD55", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 12, letterSpacing: "0.02em" }}>
      Step {current} of {total}
    </p>
  );
}

/* ════════════════════════════════════════════
   SCREEN 1 — Role selection
════════════════════════════════════════════ */
function StepRole({ data, onNext, onSkip }: { data: OnboardingData; onNext: (role: Role) => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<Role | null>(data.role);

  const roles: { id: Role; label: string; desc: string; emoji: string; perks: string[] }[] = [
    {
      id: "learner", label: "Learner", emoji: "🎓",
      desc: "Intern or student enrolled in a learning program",
      perks: ["Access course content and materials", "Submit assignments", "Collaborate with peers", "Earn certificates", "Track personal progress"],
    },
    {
      id: "mentor", label: "Mentor", emoji: "🧑‍🏫",
      desc: "Intern or student enrolled in a learning program",
      perks: ["Access course content and materials", "Submit assignments", "Collaborate with peers", "Earn certificates", "Track personal progress"],
    },
  ];

  return (
    <ScreenShell onBack={() => {}} onSkip={onSkip}>
      <div className="anim-up" style={{ textAlign: "center", marginBottom: 40 }}>
        <StepLabel current={1} total={4} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "white", marginBottom: 12 }}>
          What's your <span style={{ color: "#E9BD55" }}>role?</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>
          Choose how you'll be using TalentFlow. This sets up your experience, navigation, and default permissions.
        </p>
      </div>

      <div className="anim-up anim-d1" style={{ display: "flex", gap: 16, width: "100%", maxWidth: 660, marginBottom: 48 }}>
        {roles.map((r) => (
          <button
            key={r.id}
            className={`role-card ${selected === r.id ? "selected" : ""}`}
            onClick={() => setSelected(r.id)}
          >
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, marginBottom: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}>
              {r.emoji}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{r.label}</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>{r.desc}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left", width: "100%" }}>
              {r.perks.map((p) => (
                <li key={p} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", flexShrink: 0 }} />
                  {p}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="anim-up anim-d2" style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-gold" style={{ width: "100%" }} onClick={() => selected && onNext(selected)}>
          Continue
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#112920" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </ScreenShell>
  );
}

/* ════════════════════════════════════════════
   SCREEN 2 — Track selection
════════════════════════════════════════════ */
function StepTrack({ data, onNext, onBack, onSkip }: { data: OnboardingData; onNext: (track: Track) => void; onBack: () => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<Track | null>(data.track);

  return (
    <ScreenShell onBack={onBack} onSkip={onSkip}>
      <div className="anim-up" style={{ textAlign: "center", marginBottom: 36 }}>
        <StepLabel current={2} total={4} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "white", marginBottom: 12 }}>
          Choose your learning track
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.6, maxWidth: 460 }}>
          This information will appear on your learner profile and certificate.
        </p>
      </div>

      <div
        className="anim-up anim-d1"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 660, marginBottom: 48 }}
      >
        {TRACKS.map((t) => (
          <button
            key={t.id}
            className={`track-card ${selected === t.id ? "selected" : ""}`}
            onClick={() => setSelected(t.id)}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              {t.emoji}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.label}</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{t.modules} modules</p>
            </div>
          </button>
        ))}
      </div>

      <div className="anim-up anim-d2" style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-gold" style={{ width: "100%" }} onClick={() => selected && onNext(selected)}>
          Continue
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#112920" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </ScreenShell>
  );
}

/* ════════════════════════════════════════════
   SCREEN 3 — Email verification (OTP)
════════════════════════════════════════════ */
function StepVerify({ data, onNext, onBack, onSkip }: { data: OnboardingData; onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <ScreenShell onBack={onBack} onSkip={onSkip}>
      <div className="anim-up" style={{ textAlign: "center", marginBottom: 36 }}>
        {/* Mail icon */}
        <div className="anim-scale" style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "#E9BD55",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#112920",
          }}>
            ✉️
          </div>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "white", marginBottom: 10 }}>
          Check your email
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 6 }}>
          We have sent a 6-digit verification code to
        </p>
        <p style={{ color: "#E9BD55", fontSize: 15, fontWeight: 600 }}>
          {data.email || "forexample@youremail.com"}
        </p>
      </div>

      {/* OTP inputs */}
      <div className="anim-up anim-d1" style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: "center" }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`otp-box${digit ? " filled" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
          />
        ))}
      </div>

      <p className="anim-up anim-d2" style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 52 }}>
        Didn't receive it?{" "}
        <button
          onClick={() => setOtp(["", "", "", "", "", ""])}
          style={{ background: "none", border: "none", color: "#E9BD55", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Resend code
        </button>
      </p>

      <div className="anim-up anim-d3" style={{ width: "100%", maxWidth: 400 }}>
        <button className="btn-gold" style={{ width: "100%" }} onClick={onNext}>
          Continue
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#112920" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </ScreenShell>
  );
}

/* ════════════════════════════════════════════
   SCREEN 4 — All set / profile summary
════════════════════════════════════════════ */
function StepAllSet({ data, onBack, onFinish }: { data: OnboardingData; onBack: () => void; onFinish: () => void }) {
  const trackLabel = TRACKS.find((t) => t.id === data.track)?.label ?? "UI/UX";

  return (
    <ScreenShell onBack={onBack} onSkip={onFinish}>
      <div className="anim-up" style={{ textAlign: "center", marginBottom: 36 }}>
        {/* Trophy icon */}
        <div className="anim-scale" style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "#E9BD55",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>
            🏆
          </div>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "white", marginBottom: 10 }}>
          You are all set{" "}
          <span style={{ color: "#E9BD55" }}>{USER_NAME}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.65, maxWidth: 400 }}>
          Your account is ready. Your first course is queued.<br />
          Time to make it count.
        </p>
      </div>

      {/* Profile summary card */}
      <div className="anim-up anim-d1 profile-table" style={{ marginBottom: 52 }}>
        <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "white", fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Your profile summary</p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 2 }}>Customize your profile on the app</p>
        </div>

        <div className="profile-row">
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Role</span>
          <span style={{ color: "white", fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{data.role ?? "Learner"}</span>
        </div>
        <div className="profile-row">
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Track</span>
          <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{trackLabel}</span>
        </div>
        <div className="profile-row">
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Intern ID</span>
          <span style={{ color: "#E9BD55", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em" }}>{INTERN_ID}</span>
        </div>
      </div>

      <div className="anim-up anim-d2" style={{ width: "100%", maxWidth: 400 }}>
        <button className="btn-gold" style={{ width: "100%" }} onClick={onFinish}>
          Continue
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#112920" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </ScreenShell>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<OnboardingData>({
    role: null,
    track: null,
    email: "forexample@youremail.com",
  });

  const goTo = (s: 1 | 2 | 3 | 4) => setStep(s);
  const finish = () => { 
    alert("Onboarding complete! Redirecting to dashboard…"); 
};

  if (step === 1)
    return (
      <StepRole
        data={data}
        onNext={(role) => { setData((d) => ({ ...d, role })); goTo(2); }}
        onSkip={() => goTo(4)}
      />
    );

  if (step === 2)
    return (
      <StepTrack
        data={data}
        onNext={(track) => { setData((d) => ({ ...d, track })); goTo(3); }}
        onBack={() => goTo(1)}
        onSkip={() => goTo(4)}
      />
    );

  if (step === 3)
    return (
      <StepVerify
        data={data}
        onNext={() => goTo(4)}
        onBack={() => goTo(2)}
        onSkip={() => goTo(4)}
      />
    );

  return (
    <StepAllSet
      data={data}
      onBack={() => goTo(3)}
      onFinish={finish}
    />
  );
}