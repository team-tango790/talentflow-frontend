// app/dashboard/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import SideBar from "@/components/sidebar";

/* ════════════════════════════════════
   API CONFIG
════════════════════════════════════ */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
});

/* ════════════════════════════════════
   API FUNCTIONS
════════════════════════════════════ */

/** GET /api/intern/dashboard — main dashboard summary */
async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/intern/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Dashboard fetch failed (${res.status})`);
  return res.json();
}

/** GET /api/intern/study-logs/summary — message-level study logs */
async function getStudyLogs() {
  const res = await fetch(`${BASE_URL}/api/intern/study-logs/summary`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Study logs fetch failed (${res.status})`);
  return res.json();
}

/** GET /api/intern/enrollments — active enrollment + meetings */
async function getEnrollments() {
  const res = await fetch(`${BASE_URL}/api/intern/enrollments`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Enrollments fetch failed (${res.status})`);
  return res.json();
}

/** GET /api/intern/course-progress — per-module progress list */
async function getCourseProgress() {
  const res = await fetch(`${BASE_URL}/api/intern/course-progress`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Course progress fetch failed (${res.status})`);
  return res.json();
}

/** GET /api/intern/study-overtime — chart data (bar + line) */
async function getStudyOvertime() {
  const res = await fetch(`${BASE_URL}/api/intern/study-overtime`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Study overtime fetch failed (${res.status})`);
  return res.json();
}

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface DashboardData {
  user?: { name: string; avatar?: string };
  stats?: {
    gradePointAverage: number;
    completedModules: number;
    totalStudyTimeHours: number;
    cohortLevel: string | number;
  };
  activeEnrollment?: {
    progress: number;
    course: { title: string; totalModules: number; level: string; track?: string };
  };
  messages?: Message[];
  meetings?: Meeting[];
  studyActivity?: ActivityDay[];
  courseProgressList?: ModuleProgress[];
}

interface Message {
  sender: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  text: string;
  time: string;
  unread?: number;
  avatars?: string[];
}

interface Meeting {
  title: string;
  boldPart?: string;
  badgeBg: string;
  badgeColor: string;
  badgeText: string;
  barColor: string;
}

interface ActivityDay {
  date: string;
  lessonsCompleted: number;
  hoursSpent?: number;
}

interface ModuleProgress {
  moduleTitle: string;
  completedCount: number;
  totalCount: number;
  percentage?: number;
}

/* ════════════════════════════════════
   FALLBACK DATA
════════════════════════════════════ */
const FALLBACK_MESSAGES: Message[] = [
  {
    sender: "Team tango", initials: "TT", avatarBg: "#d1fae5", avatarColor: "#065f46",
    text: "Favour: Hi guys, please be reminded of our meeting later today, avail yourself as we will be reviewing the project's milestone 1",
    time: "2:30pm", unread: 4,
  },
  {
    sender: "John Doe", initials: "JD", avatarBg: "#dbeafe", avatarColor: "#1e40af",
    text: "Hi Farida, I have just graded your assignments and let you some feedbacks, please pay close attention to the highlighted feedbacks.",
    time: "2:30pm", unread: 4,
  },
  {
    sender: "Team tango", initials: "TT", avatarBg: "#d1fae5", avatarColor: "#065f46",
    text: "Favour: Hi guys, please be reminded of our meeting later today, avail yourself as we will be reviewing the project's milestone 1",
    time: "2:30pm", unread: 4,
  },
  {
    sender: "John Doe", initials: "JD", avatarBg: "#dbeafe", avatarColor: "#1e40af",
    text: "Hi Farida, I have just graded your assignments and let you some feedbacks, please pay close attention to the highlighted feedbacks.",
    time: "2:30pm", unread: 4,
  },
];

const FALLBACK_MEETINGS: Meeting[] = [
  { title: "Team work hour Discuss BRD document", boldPart: "Discuss BRD document", badgeBg: "#fde8e8", badgeColor: "#a32d2d", badgeText: "Today· 4:00PM WAT", barColor: "#e74c3c" },
  { title: "Live class Laws of design", boldPart: "Laws of design", badgeBg: "#fef9e7", badgeColor: "#b8860b", badgeText: "April 26th 2026", barColor: "#e6ac25" },
  { title: "Team call up Milestone 1 review", boldPart: "Milestone 1 review", badgeBg: "#e8f5ef", badgeColor: "#2d6a4f", badgeText: "May 4th 2026", barColor: "#52b788" },
  { title: "Live class Design system", boldPart: "Design system", badgeBg: "#e6fffa", badgeColor: "#0c8577", badgeText: "June 12th 2026", barColor: "#14b8a6" },
];

const FALLBACK_ACTIVITY: ActivityDay[] = [
  { date: "2026-04-07", lessonsCompleted: 45, hoursSpent: 5 },
  { date: "2026-04-08", lessonsCompleted: 50, hoursSpent: 3 },
  { date: "2026-04-09", lessonsCompleted: 30, hoursSpent: 3.5 },
  { date: "2026-04-10", lessonsCompleted: 20, hoursSpent: 4.5 },
  { date: "2026-04-11", lessonsCompleted: 60, hoursSpent: 6 },
  { date: "2026-04-12", lessonsCompleted: 40, hoursSpent: 4 },
  { date: "2026-04-13", lessonsCompleted: 18, hoursSpent: 3 },
];

const FALLBACK_MODULES: ModuleProgress[] = [
  { moduleTitle: "What is UI/UX?", completedCount: 8, totalCount: 10, percentage: 80 },
  { moduleTitle: "Laws of design", completedCount: 6, totalCount: 10, percentage: 60 },
  { moduleTitle: "Laws of design", completedCount: 8, totalCount: 10, percentage: 80 },
  { moduleTitle: "Laws of design", completedCount: 10, totalCount: 10, percentage: 100 },
  { moduleTitle: "Laws of design", completedCount: 6, totalCount: 10, percentage: 60 },
];

/* ════════════════════════════════════
   SMALL COMPONENTS
════════════════════════════════════ */
const ProgressBar = ({ value, color = "#e3b448" }: { value: number; color?: string }) => (
  <div style={{ background: "#e5e7eb", borderRadius: 4, height: 5, width: "100%", overflow: "hidden" }}>
    <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
  </div>
);

const Avatar = ({ initials, bg, color, size = 34 }: { initials: string; bg: string; color: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
    {initials}
  </div>
);

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ViewAllBtn = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#111", display: "flex", alignItems: "center", gap: 4, fontWeight: 600, whiteSpace: "nowrap" }}>
    View all <ArrowRight />
  </button>
);

const DotLabel = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
    <span style={{ fontWeight: 700, fontSize: 16, color: "#1f2937" }}>{children}</span>
  </div>
);

/* ════════════════════════════════════
   STAT CARD
════════════════════════════════════ */
const StatCard = ({
  number, label, sublabel, sublabelColor, icon,
}: { number: string | number; label: string; sublabel?: string; sublabelColor?: string; icon: React.ReactNode }) => (
  <div style={{
    flex: 1, background: "#fff",
    border: "1.5px solid #2dd4bf",
    borderRadius: 12, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 6,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: "#111", lineHeight: 1 }}>{number}</span>
      <span style={{ borderRadius: 8, padding: "7px 9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
    </div>
    <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</div>
    {sublabel && (
      <div style={{ fontSize: 11, color: sublabelColor ?? "#14b8a6", fontWeight: 500 }}>{sublabel}</div>
    )}
  </div>
);

/* ════════════════════════════════════
   STUDY ACTIVITY CHART
════════════════════════════════════ */
const StudyChart = ({ activityData }: { activityData: ActivityDay[] }) => {
  const days = activityData.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
  );
  const bars = activityData.map((d) => d.lessonsCompleted);
  const lineVals = activityData.map((d) => d.hoursSpent ?? 0);

  const barMax = Math.max(...bars, 60);
  const lineMax = Math.max(...lineVals, 6);

  const W = 520; const H = 240;
  const padL = 40; const padR = 40; const padT = 16; const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = chartW / days.length;
  const barGap = 18;

  const getBx = (i: number) => padL + i * barW + barGap / 2;
  const getBy = (v: number) => padT + chartH - (v / barMax) * chartH;
  const getLx = (i: number) => padL + i * barW + barW / 2;
  const getLy = (v: number) => padT + chartH - (v / lineMax) * chartH;

  const linePoints = lineVals.map((v, i) => `${getLx(i)},${getLy(v)}`).join(" ");
  const gridLines = [0, 10, 20, 30, 40, 50, 60];
  const lineGrid = [0, 1, 2, 3, 4, 5, 6];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {/* Grid */}
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={getBy(v)} x2={W - padR} y2={getBy(v)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={padL - 6} y={getBy(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
        </g>
      ))}
      {lineGrid.map((v, i) => (
        <text key={i} x={W - padR + 8} y={getLy(v) + 4} textAnchor="start" fontSize="10" fill="#9ca3af">{v}</text>
      ))}

      {/* Bars */}
      {bars.map((v, i) => (
        <rect key={i} x={getBx(i)} y={getBy(v)} width={barW - barGap} height={chartH - (getBy(v) - padT)} fill="#b7e4d0" rx="3" />
      ))}

      {/* Line */}
      <polyline points={linePoints} fill="none" stroke="#e9b036" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {lineVals.map((v, i) => (
        <circle key={i} cx={getLx(i)} cy={getLy(v)} r="5" fill="#e9b036" stroke="#fff" strokeWidth="2" />
      ))}

      {/* X labels */}
      {days.map((d, i) => (
        <text key={i} x={getLx(i)} y={H - 4} textAnchor="middle" fontSize="11" fill="#9ca3af">{d}</text>
      ))}
    </svg>
  );
};

/* ════════════════════════════════════
   ICON SET
════════════════════════════════════ */
const BookIcon = ({ color }: { color: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const FolderIcon = ({ color }: { color: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const ClockIcon = ({ color }: { color: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const MonitorIcon = ({ color }: { color: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

/* ════════════════════════════════════
   SKELETON LOADER
════════════════════════════════════ */
const Skeleton = ({ h = 16, w = "100%", radius = 6 }: { h?: number; w?: number | string; radius?: number }) => (
  <div style={{ height: h, width: w, borderRadius: radius, background: "linear-gradient(90deg, #e8e8e0 25%, #d8d8d0 50%, #e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
);

/* ════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════ */
export default function Dashboard() {
  const [dashData, setDashData]           = useState<DashboardData | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [meetings, setMeetings]           = useState<Meeting[]>([]);
  const [courseProgress, setCourseProgress] = useState<ModuleProgress[]>([]);
  const [activityData, setActivityData]   = useState<ActivityDay[]>([]);
  const [loading, setLoading]             = useState(true);
  const [errors, setErrors]               = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const errs: Record<string, string> = {};

    // ── 1. Dashboard (stats + user + enrollment) ──
    let dash: DashboardData = {};
    try {
      const res = await getDashboard();
      dash = res?.data ?? res ?? {};
      setDashData(dash);
    } catch (e: any) {
      errs.dashboard = e.message;
      setDashData({});
    }

    // ── 2. Study logs / messages ──
    try {
      const res = await getStudyLogs();
      const msgs = res?.data ?? res ?? [];
      setMessages(Array.isArray(msgs) && msgs.length ? msgs : FALLBACK_MESSAGES);
    } catch {
      setMessages(FALLBACK_MESSAGES);
      errs.messages = "Could not load messages";
    }

    // ── 3. Enrollments / meetings ──
    try {
      const res = await getEnrollments();
      const raw = res?.data ?? res ?? [];
      // Backend may return meeting list directly or nested
      const mtgs = Array.isArray(raw) ? raw : raw.meetings ?? [];
      setMeetings(mtgs.length ? mtgs : FALLBACK_MEETINGS);
    } catch {
      setMeetings(FALLBACK_MEETINGS);
      errs.meetings = "Could not load meetings";
    }

    // ── 4. Course progress ──
    try {
      const res = await getCourseProgress();
      const list = res?.data ?? res ?? [];
      setCourseProgress(Array.isArray(list) && list.length ? list : FALLBACK_MODULES);
    } catch {
      setCourseProgress(FALLBACK_MODULES);
      errs.progress = "Could not load progress";
    }

    // ── 5. Study overtime (chart) ──
    try {
      const res = await getStudyOvertime();
      const days = res?.data ?? res ?? [];
      setActivityData(Array.isArray(days) && days.length ? days : FALLBACK_ACTIVITY);
    } catch {
      setActivityData(FALLBACK_ACTIVITY);
      errs.chart = "Could not load chart";
    }

    setErrors(errs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Derived ── */
  const stats = dashData?.stats;
  const enrollment = dashData?.activeEnrollment;
  const userName = dashData?.user?.name ?? "—";

  /* ── Skeleton screen ── */
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f0f0e8", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{globalStyles}</style>
        <SideBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Skeleton header */}
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e2e2d8" }}>
            <Skeleton h={20} w={220} />
            <div style={{ marginTop: 8 }}><Skeleton h={13} w={320} /></div>
          </div>
          {/* Skeleton stat cards */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ flex: 1, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 12, padding: "18px 20px" }}>
                <Skeleton h={30} w={80} /><div style={{ marginTop: 10 }}><Skeleton h={13} w="80%" /></div>
                <div style={{ marginTop: 6 }}><Skeleton h={11} w="60%" /></div>
              </div>
            ))}
          </div>
          {/* Skeleton content rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, marginBottom: 20 }}>
            {[1, 2].map((i) => <div key={i} style={{ height: 380, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 14, overflow: "hidden" }} className="skeleton-block" />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[1, 2].map((i) => <div key={i} style={{ height: 360, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 14 }} className="skeleton-block" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f0e8", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <SideBar />

      <main style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Top Nav ── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 28px", background: "#f0f0e8", borderBottom: "1px solid #e2e2d8",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #2dd4bf", borderRadius: 20, padding: "8px 16px", width: 280 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input placeholder="Search courses, lessons, projects"
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#6b7280", width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* User icon */}
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {/* Bell icon */}
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </header>

        <div style={{ padding: "26px 28px" }}>

          {/* ── Error banner (soft) ── */}
          {Object.keys(errors).length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px 16px", marginBottom: 18, fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>⚠ Some data loaded from cache</span>
              <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", fontWeight: 600, fontSize: 12 }}>Retry all</button>
            </div>
          )}

          {/* ── Welcome ── */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Welcome back, {userName}
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0" }}>
              Here's what's happening with your learning journey today
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <StatCard
              number={`${stats?.gradePointAverage ?? 0}%`}
              label="Grade Point average"
              sublabel="↑ +5% this week"
              sublabelColor="#f4a261"
              icon={<div style={{ background: "#fef3e2", borderRadius: 8, padding: "7px 8px" }}><BookIcon color="#f4a261" /></div>}
            />
            <StatCard
              number={stats?.completedModules ?? 0}
              label="Completed module"
              sublabel="↑ 2 this month"
              sublabelColor="#ee380a"
              icon={<div style={{ background: "#fde8e8", borderRadius: 8, padding: "7px 8px" }}><FolderIcon color="#ee380a" /></div>}
            />
            <StatCard
              number={`${stats?.totalStudyTimeHours ?? 0}hrs`}
              label="Total Study time"
              sublabel="↑ 2 this month"
              sublabelColor="#008080"
              icon={<div style={{ background: "#e0f2f2", borderRadius: 8, padding: "7px 8px" }}><ClockIcon color="#008080" /></div>}
            />
            <StatCard
              number={stats?.cohortLevel ?? 1}
              label="Cohort level"
              sublabel="85% grade point to get to next level"
              sublabelColor="#c9960d"
              icon={<div style={{ background: "#fef9e0", borderRadius: 8, padding: "7px 8px" }}><MonitorIcon color="#E1AD01" /></div>}
            />
          </div>

          {/* ── Middle Row: Enrollment + Chart ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 18, marginBottom: 20 }}>

            {/* Currently Enrolled */}
            <div style={{ border: "1.5px solid #2dd4bf", borderRadius: 14, overflow: "hidden" }}>
              {/* Dark header */}
              <div style={{ background: "#1a3328", padding: "20px 22px" }}>
                <div style={{ fontSize: 11, color: "#E1AD01", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  Currently enrolled
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E1AD01" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  {enrollment?.course?.title ?? "Product Design"}
                </div>
                <div style={{ fontSize: 12, color: "#E1AD01" }}>
                  {enrollment?.course?.totalModules ?? 12} modules ·{" "}
                  {enrollment?.course?.track ?? "Introduction to UI/UX design"} ·{" "}
                  {enrollment?.course?.level ?? "Level 1"}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                    {enrollment?.progress ?? 60}%
                  </div>
                  <ProgressBar value={enrollment?.progress ?? 60} color="#74c69d" />
                  <div style={{ fontSize: 11, color: "#E1AD01", marginTop: 5 }}>Overall completion</div>
                </div>
              </div>

              {/* White module list */}
              <div style={{ padding: "18px 22px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Course progress</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {stats?.completedModules ?? 10} of {enrollment?.course?.totalModules ?? 12} modules
                    </div>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f0e8", border: "1px solid #2dd4bf", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#111" }}>
                    View all <ArrowRight />
                  </button>
                </div>

                {courseProgress.map((m, i) => {
                  const pct = m.percentage ?? (m.totalCount > 0 ? Math.round((m.completedCount / m.totalCount) * 100) : 0);
                  return (
                    <div key={i} style={{ marginBottom: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{m.moduleTitle}</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color="#e3b448" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Activity Chart */}
            <div style={{ background: "#fcfaf2", border: "1.5px solid #14b8a6", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #14b8a6", display: "flex", alignItems: "center", gap: 10 }}>
                <DotLabel color="#0c5239">Study activity</DotLabel>
              </div>
              <div style={{ padding: "24px 20px 16px" }}>
                <StudyChart activityData={activityData} />
                <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4b5563" }}>
                    <span style={{ width: 32, height: 14, borderRadius: 3, background: "#b7e4d0", display: "inline-block" }} />
                    Module completed
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4b5563" }}>
                    <span style={{ width: 32, height: 14, borderRadius: 3, background: "#e9b036", display: "inline-block" }} />
                    Time spent
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Row: Messages + Meetings ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

            {/* New Messages */}
            <div style={{ border: "1.5px solid #14b8a6", borderRadius: 14, overflow: "hidden", background: "#fcfaf2" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #14b8a6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <DotLabel color="#0c8577">New messages</DotLabel>
                <ViewAllBtn />
              </div>

              {messages.map((m, i) => (
                <div key={i} style={{ padding: "16px 20px", borderBottom: i < messages.length - 1 ? "1.5px solid #14b8a6" : "none", background: "#fcfaf2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{m.sender}</span>
                    <span style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>Today {m.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.55, marginBottom: 12 }}>
                    {m.text}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Group avatars overlap */}
                    <div style={{ display: "flex" }}>
                      {["TT", "JD", "AB"].slice(0, 3).map((init, ai) => (
                        <div key={ai} style={{
                          width: 28, height: 28, borderRadius: "50%", border: "2px solid #fcfaf2",
                          background: ai === 0 ? "#d1fae5" : ai === 1 ? "#dbeafe" : "#fde8d8",
                          color: ai === 0 ? "#065f46" : ai === 1 ? "#1e40af" : "#92400e",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, marginLeft: ai > 0 ? -8 : 0,
                        }}>
                          {init}
                        </div>
                      ))}
                    </div>
                    <div style={{ width: 19, height: 19, borderRadius: "50%", background: "#eab308", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {m.unread ?? 4}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Meetings */}
            <div style={{ border: "1.5px solid #14b8a6", borderRadius: 14, overflow: "hidden", background: "#fcfaf2" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #14b8a6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <DotLabel color="#e74c3c">Upcoming meetings</DotLabel>
                <ViewAllBtn />
              </div>

              {meetings.map((meeting, i) => {
                // Split title by boldPart for rendering
                const parts = meeting.boldPart
                  ? meeting.title.split(meeting.boldPart)
                  : [meeting.title];

                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: i < meetings.length - 1 ? "1.5px solid #14b8a6" : "none" }}>
                    {/* Color bar */}
                    <div style={{ width: 4, height: 44, background: meeting.barColor, borderRadius: 4, marginRight: 16, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 7, lineHeight: 1.4 }}>
                        {parts[0]}
                        {meeting.boldPart && (
                          <span style={{ fontWeight: 700, color: "#1f2937" }}>{meeting.boldPart}</span>
                        )}
                        {parts[1] ?? ""}
                      </div>
                      <span style={{
                        display: "inline-block",
                        background: meeting.badgeBg, color: meeting.badgeColor,
                        fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                      }}>
                        {meeting.badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════
   GLOBAL STYLES
════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .skeleton-block {
    background: linear-gradient(90deg, #eeeee6 25%, #e4e4dc 50%, #eeeee6 75%) !important;
    background-size: 800px 100% !important;
    animation: shimmer 1.4s infinite linear;
  }

  input::placeholder { color: #9ca3af; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c8d8d2; border-radius: 10px; }
`;