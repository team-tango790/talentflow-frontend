// app/dashboard/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import SideBar from "@/components/sidebar";
import { getDashboard, getStudyOvertime, BASE_URL, getHeaders, safeJson } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface DashboardData {
  user?: {
    name: string;
    internId?: string;
    track?: string;
    profilePhoto?: string | null;
    cohort?: { name: string };
  };
  stats?: {
    gradePointAverage?: number;
    overallGpa?: number;
    completedModules?: number;
    completedLessons?: number;
    totalStudyTimeHours?: number;
    totalStudyHours?: number;
    cohortLevel?: string | number;
    currentStage?: string | number;
    currentStreak?: number;
    overallProgress?: number;
  };
  activeEnrollment?: {
    progress: number;
    courseId?: string;
    course: {
      id?: string;
      title: string;
      totalModules?: number;
      level?: string;
      track?: string;
      modules?: { id: string; title: string }[];
    };
  };
  moduleProgress?: ModuleProgress[];
}

interface LiveSession {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  duration: number;
  platform: "ZOOM" | "YOUTUBE" | "GOOGLE_MEET" | "OTHER";
  platformUrl?: string | null;
  mentor?: { name: string };
  _count?: { rsvps: number };
  userHasRsvp?: boolean;
}

interface Message {
  sender: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  text: string;
  time: string;
  unread?: number;
}

interface ActivityDay {
  date?: string;
  period?: string;
  lessonsCompleted?: number;
  hoursSpent?: number;
  hours?: number;
}

interface ModuleProgress {
  moduleTitle?: string;
  title?: string;
  completedCount?: number;
  completedLessons?: number;
  totalCount?: number;
  totalLessons?: number;
  percentage?: number;
  progress?: number;
}

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function formatSessionDateTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (diffMs < 0) return { label: `${dateLabel} · ${time}`, badge: "Past", badgeBg: "#f3f4f6", badgeColor: "#9ca3af", barColor: "#d1d5db", isToday: false, isPast: true };
  if (diffDays === 0) return { label: `Today · ${time}`, badge: "Today", badgeBg: "#dcfce7", badgeColor: "#16a34a", barColor: "#16a34a", isToday: true, isPast: false };
  if (diffDays === 1) return { label: `Tomorrow · ${time}`, badge: "Tomorrow", badgeBg: "#dbeafe", badgeColor: "#2563eb", barColor: "#2563eb", isToday: false, isPast: false };
  return { label: `${dateLabel} · ${time}`, badge: dateLabel, badgeBg: "#fef9e7", badgeColor: "#b8860b", barColor: "#e6ac25", isToday: false, isPast: false };
}

function getPlatformIcon(platform: string) {
  if (platform === "ZOOM") return "🎥";
  if (platform === "GOOGLE_MEET") return "📹";
  if (platform === "YOUTUBE") return "▶️";
  return "🔗";
}

/* ════════════════════════════════════
   FALLBACK DATA
════════════════════════════════════ */
const FALLBACK_MESSAGES: Message[] = [
  { sender: "Team tango", initials: "TT", avatarBg: "#d1fae5", avatarColor: "#065f46", text: "Favour: Hi guys, please be reminded of our meeting later today, avail yourself as we will be reviewing the project's milestone 1", time: "2:30pm", unread: 4 },
  { sender: "John Doe", initials: "JD", avatarBg: "#dbeafe", avatarColor: "#1e40af", text: "Hi Farida, I have just graded your assignments and left you some feedback, please pay close attention to the highlighted sections.", time: "2:30pm", unread: 4 },
  { sender: "Team tango", initials: "TT", avatarBg: "#d1fae5", avatarColor: "#065f46", text: "Favour: Hi guys, please be reminded of our meeting later today.", time: "2:30pm", unread: 2 },
  { sender: "John Doe", initials: "JD", avatarBg: "#dbeafe", avatarColor: "#1e40af", text: "Your submissions have been reviewed. Please check feedback.", time: "2:30pm", unread: 1 },
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
  { moduleTitle: "Typography fundamentals", completedCount: 8, totalCount: 10, percentage: 80 },
  { moduleTitle: "Design systems", completedCount: 10, totalCount: 10, percentage: 100 },
  { moduleTitle: "Prototyping", completedCount: 6, totalCount: 10, percentage: 60 },
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

const StatCard = ({ number, label, sublabel, sublabelColor, icon }: { number: string | number; label: string; sublabel?: string; sublabelColor?: string; icon: React.ReactNode }) => (
  <div style={{ flex: 1, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: "#111", lineHeight: 1 }}>{number}</span>
      <span style={{ borderRadius: 8, padding: "7px 9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</div>
    {sublabel && <div style={{ fontSize: 11, color: sublabelColor ?? "#14b8a6", fontWeight: 500 }}>{sublabel}</div>}
  </div>
);

/* ════════════════════════════════════
   STUDY CHART
════════════════════════════════════ */
const StudyChart = ({ activityData }: { activityData: ActivityDay[] }) => {
  const days = activityData.map((d) => {
    if (d.period) return d.period;
    if (d.date) return new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
    return "—";
  });
  const bars = activityData.map((d) => d.lessonsCompleted ?? 0);
  const lineVals = activityData.map((d) => d.hoursSpent ?? d.hours ?? 0);
  const barMax = Math.max(...bars, 60);
  const lineMax = Math.max(...lineVals, 6);
  const W = 520; const H = 240;
  const padL = 40; const padR = 40; const padT = 16; const padB = 36;
  const chartW = W - padL - padR; const chartH = H - padT - padB;
  const barW = chartW / days.length; const barGap = 18;
  const getBx = (i: number) => padL + i * barW + barGap / 2;
  const getBy = (v: number) => padT + chartH - (v / barMax) * chartH;
  const getLx = (i: number) => padL + i * barW + barW / 2;
  const getLy = (v: number) => padT + chartH - (v / lineMax) * chartH;
  const linePoints = lineVals.map((v, i) => `${getLx(i)},${getLy(v)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {[0, 10, 20, 30, 40, 50, 60].map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={getBy(v)} x2={W - padR} y2={getBy(v)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={padL - 6} y={getBy(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((v, i) => (
        <text key={i} x={W - padR + 8} y={getLy(v) + 4} textAnchor="start" fontSize="10" fill="#9ca3af">{v}</text>
      ))}
      {bars.map((v, i) => (
        <rect key={i} x={getBx(i)} y={getBy(v)} width={barW - barGap} height={chartH - (getBy(v) - padT)} fill="#b7e4d0" rx="3" />
      ))}
      <polyline points={linePoints} fill="none" stroke="#e9b036" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {lineVals.map((v, i) => (
        <circle key={i} cx={getLx(i)} cy={getLy(v)} r="5" fill="#e9b036" stroke="#fff" strokeWidth="2" />
      ))}
      {days.map((d, i) => (
        <text key={i} x={getLx(i)} y={H - 4} textAnchor="middle" fontSize="11" fill="#9ca3af">{d}</text>
      ))}
    </svg>
  );
};

/* ════════════════════════════════════
   ICON SET
════════════════════════════════════ */
const BookIcon = ({ color }: { color: string }) => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const FolderIcon = ({ color }: { color: string }) => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>);
const ClockIcon = ({ color }: { color: string }) => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const MonitorIcon = ({ color }: { color: string }) => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>);

const Skeleton = ({ h = 16, w = "100%", radius = 6 }: { h?: number; w?: number | string; radius?: number }) => (
  <div style={{ height: h, width: w, borderRadius: radius, background: "linear-gradient(90deg, #e8e8e0 25%, #d8d8d0 50%, #e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
);

/* ════════════════════════════════════
   MEETINGS / LIVE SESSIONS SECTION
════════════════════════════════════ */
function LiveSessionsPanel({ sessions, loading, onRsvpChange }: {
  sessions: LiveSession[];
  loading: boolean;
  onRsvpChange: (id: string, hasRsvp: boolean) => void;
}) {
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  const handleRsvp = async (session: LiveSession) => {
    setRsvpLoading(session.id);
    try {
      if (session.userHasRsvp) {
        await fetch(`${BASE_URL}/api/live-sessions/${session.id}/rsvp`, { method: "DELETE", headers: getHeaders() });
        onRsvpChange(session.id, false);
      } else {
        const res = await fetch(`${BASE_URL}/api/live-sessions/${session.id}/rsvp`, { method: "POST", headers: getHeaders() });
        if (!res.ok) {
          const err = await safeJson<{ message?: string }>(res);
          alert(err?.message ?? "Could not RSVP. Make sure you are enrolled in the course.");
          return;
        }
        onRsvpChange(session.id, true);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRsvpLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "16px 20px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginBottom: 16 }}>
            <Skeleton h={13} w="60%" /><div style={{ marginTop: 6 }}><Skeleton h={10} w="40%" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: "24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
        <p style={{ fontSize: 13, color: "#9ca3af" }}>No upcoming sessions</p>
        <p style={{ fontSize: 11, color: "#c4c4bc", marginTop: 4 }}>Your mentor will schedule sessions here</p>
      </div>
    );
  }

  return (
    <div>
      {sessions.map((session, i) => {
        const { label, badge, badgeBg, badgeColor, barColor, isToday } = formatSessionDateTime(session.scheduledAt);
        const isLoading = rsvpLoading === session.id;

        return (
          <div key={session.id} style={{
            display: "flex", alignItems: "flex-start",
            padding: "14px 20px",
            borderBottom: i < sessions.length - 1 ? "1.5px solid #14b8a6" : "none",
            background: isToday ? "#f8fffb" : "transparent",
          }}>
            {/* Color bar */}
            <div style={{ width: 4, minHeight: 44, background: barColor, borderRadius: 4, marginRight: 14, flexShrink: 0, alignSelf: "stretch" }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Platform icon + title */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{getPlatformIcon(session.platform)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", lineHeight: 1.3 }}>{session.title}</span>
              </div>

              {/* Mentor */}
              {session.mentor && (
                <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 5 }}>
                  with {session.mentor.name} · {session.duration} min
                </p>
              )}

              {/* Badge */}
              <span style={{
                display: "inline-block",
                background: badgeBg, color: badgeColor,
                fontSize: 10, padding: "2px 10px", borderRadius: 20, fontWeight: 700,
              }}>
                {badge === "Today" ? `🔴 ${label}` : label}
              </span>

              {/* RSVP'd badge */}
              {session.userHasRsvp && (
                <span style={{ display: "inline-block", marginLeft: 6, background: "#eff6ff", color: "#2563eb", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                  ✓ RSVP'd
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0, marginLeft: 10 }}>
              {/* Join — today with URL */}
              {isToday && session.platformUrl && (
                <a href={session.platformUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 7, background: "#112920", color: "white", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Join now
                </a>
              )}
              {/* RSVP */}
              <button onClick={() => handleRsvp(session)} disabled={isLoading}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
                  border: `1.5px solid ${session.userHasRsvp ? "#fca5a5" : "#2dd4bf"}`,
                  background: session.userHasRsvp ? "#fef2f2" : "transparent",
                  color: session.userHasRsvp ? "#dc2626" : "#0f766e",
                  cursor: isLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                {isLoading
                  ? <span style={{ width: 10, height: 10, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  : session.userHasRsvp ? "Cancel" : "RSVP"
                }
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════ */
export default function Dashboard() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [messages] = useState<Message[]>(FALLBACK_MESSAGES);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<ModuleProgress[]>([]);
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Fetch live sessions for the intern's enrolled course ──
  const loadLiveSessions = useCallback(async (courseId: string) => {
    setSessionsLoading(true);
    try {
      // Get course overview which may include session IDs
      const res = await fetch(`${BASE_URL}/api/courses/${courseId}/overview`, { headers: getHeaders() });
      if (!res.ok) { setSessionsLoading(false); return; }
      const json = await res.json();
      const sessionIds: string[] = json?.data?.liveSessionIds ?? json?.data?.upcomingSessions ?? [];

      if (!sessionIds.length) { setLiveSessions([]); setSessionsLoading(false); return; }

      const results = await Promise.allSettled(
        sessionIds.map(id =>
          fetch(`${BASE_URL}/api/live-sessions/${id}`, { headers: getHeaders() })
            .then(r => r.json()).then(d => d?.data ?? d)
        )
      );

      const sessions: LiveSession[] = results
        .filter((r): r is PromiseFulfilledResult<LiveSession> => r.status === "fulfilled" && !!r.value?.id)
        .map(r => r.value)
        .filter(s => new Date(s.scheduledAt) > new Date()) // upcoming only on dashboard
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 4); // show max 4 on dashboard

      setLiveSessions(sessions);
    } catch {
      setLiveSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const errs: Record<string, string> = {};

    // ── 1. Dashboard (stats + user + enrollment) ──
    try {
      const res = await getDashboard();
      const data = res?.data ?? res ?? {};
      setDashData(data);

      if (data?.moduleProgress?.length) {
        setCourseProgress(data.moduleProgress);
      } else if (data?.activeEnrollment?.course?.modules?.length) {
        setCourseProgress(data.activeEnrollment.course.modules);
      } else {
        setCourseProgress(FALLBACK_MODULES);
      }

      // Kick off live sessions fetch once we know the courseId
      const courseId = data?.activeEnrollment?.courseId ?? data?.activeEnrollment?.course?.id;
      if (courseId) {
        loadLiveSessions(courseId);
      } else {
        setSessionsLoading(false);
      }
    } catch (e: unknown) {
      errs.dashboard = e instanceof Error ? e.message : "Dashboard error";
      setDashData({});
      setCourseProgress(FALLBACK_MODULES);
      setSessionsLoading(false);
    }

    // ── 2. Study activity chart ──
    try {
      const res = await getStudyOvertime("weekly");
      const days = res?.data ?? res ?? [];
      setActivityData(Array.isArray(days) && days.length ? days : FALLBACK_ACTIVITY);
    } catch {
      setActivityData(FALLBACK_ACTIVITY);
      errs.chart = "Could not load chart";
    }

    setErrors(errs);
    setLoading(false);
  }, [loadLiveSessions]);

  useEffect(() => { load(); }, [load]);

  const handleRsvpChange = (id: string, hasRsvp: boolean) => {
    setLiveSessions(prev => prev.map(s => s.id === id ? { ...s, userHasRsvp: hasRsvp } : s));
  };

  const stats = dashData?.stats;
  const enrollment = dashData?.activeEnrollment;
  const userName = dashData?.user?.name ?? "—";
  const gpa = stats?.overallGpa ?? stats?.gradePointAverage ?? 0;
  const completedModules = stats?.completedModules ?? 0;
  const studyHours = stats?.totalStudyHours ?? stats?.totalStudyTimeHours ?? 0;
  const cohortLevel = stats?.currentStage ?? stats?.cohortLevel ?? 1;

  /* ── Skeleton screen ── */
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f0f0e8", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{globalStyles}</style>
        <SideBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e2e2d8" }}>
            <Skeleton h={20} w={220} /><div style={{ marginTop: 8 }}><Skeleton h={13} w={320} /></div>
          </div>
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 12, padding: "18px 20px" }}>
                <Skeleton h={30} w={80} /><div style={{ marginTop: 10 }}><Skeleton h={13} w="80%" /></div>
                <div style={{ marginTop: 6 }}><Skeleton h={11} w="60%" /></div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, marginBottom: 20 }}>
            {[1, 2].map(i => <div key={i} style={{ height: 380, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 14 }} className="skeleton-block" />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[1, 2].map(i => <div key={i} style={{ height: 360, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 14 }} className="skeleton-block" />)}
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
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#f0f0e8", borderBottom: "1px solid #e2e2d8", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #2dd4bf", borderRadius: 20, padding: "8px 16px", width: 280 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input placeholder="Search courses, lessons, projects" style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#6b7280", width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </button>
          </div>
        </header>

        <div style={{ padding: "26px 28px" }}>
          {/* Error banner */}
          {Object.keys(errors).length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px 16px", marginBottom: 18, fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>⚠ Some sections loaded from fallback data</span>
              <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", fontWeight: 600, fontSize: 12 }}>Retry</button>
            </div>
          )}

          {/* Welcome */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Welcome back, {userName}</h1>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0" }}>Here&apos;s what&apos;s happening with your learning journey today</p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <StatCard number={`${gpa}%`} label="Grade Point Average" sublabel="↑ +5% this week" sublabelColor="#f4a261" icon={<div style={{ background: "#fef3e2", borderRadius: 8, padding: "7px 8px" }}><BookIcon color="#f4a261" /></div>} />
            <StatCard number={completedModules} label="Completed Modules" sublabel="↑ 2 this month" sublabelColor="#ee380a" icon={<div style={{ background: "#fde8e8", borderRadius: 8, padding: "7px 8px" }}><FolderIcon color="#ee380a" /></div>} />
            <StatCard number={`${studyHours}hrs`} label="Total Study Time" sublabel="↑ 2 this month" sublabelColor="#008080" icon={<div style={{ background: "#e0f2f2", borderRadius: 8, padding: "7px 8px" }}><ClockIcon color="#008080" /></div>} />
            <StatCard number={cohortLevel} label="Cohort Level" sublabel="85% grade to reach next level" sublabelColor="#c9960d" icon={<div style={{ background: "#fef9e0", borderRadius: 8, padding: "7px 8px" }}><MonitorIcon color="#E1AD01" /></div>} />
          </div>

          {/* ── Middle Row: Enrollment + Chart ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 18, marginBottom: 20 }}>
            {/* Currently Enrolled */}
            <div style={{ border: "1.5px solid #2dd4bf", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "#1a3328", padding: "20px 22px" }}>
                <div style={{ fontSize: 11, color: "#E1AD01", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  Currently enrolled
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E1AD01" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  {enrollment?.course?.title ?? "No active enrollment"}
                </div>
                <div style={{ fontSize: 12, color: "#E1AD01" }}>
                  {enrollment?.course?.modules?.length ?? enrollment?.course?.totalModules ?? 0} modules · {enrollment?.course?.track ?? "—"} · {enrollment?.course?.level ?? "—"}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{enrollment?.progress ?? 0}%</div>
                  <ProgressBar value={enrollment?.progress ?? 0} color="#74c69d" />
                  <div style={{ fontSize: 11, color: "#E1AD01", marginTop: 5 }}>Overall completion</div>
                </div>
              </div>
              <div style={{ padding: "18px 22px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Course progress</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{completedModules} modules completed</div>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f0e8", border: "1px solid #2dd4bf", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#111" }}>
                    View all <ArrowRight />
                  </button>
                </div>
                {courseProgress.map((m, i) => {
                  const pct = m.percentage ?? m.progress ??
                    ((m.totalCount ?? m.totalLessons ?? 0) > 0
                      ? Math.round(((m.completedCount ?? m.completedLessons ?? 0) / (m.totalCount ?? m.totalLessons ?? 1)) * 100)
                      : 0);
                  return (
                    <div key={i} style={{ marginBottom: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{m.moduleTitle ?? m.title}</span>
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

          {/* ── Bottom Row: Messages + Live Sessions ── */}
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
                  <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.55, marginBottom: 12 }}>{m.text}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex" }}>
                      {["TT", "JD", "AB"].map((init, ai) => (
                        <Avatar key={ai} initials={init} bg={ai === 0 ? "#d1fae5" : ai === 1 ? "#dbeafe" : "#fde8d8"} color={ai === 0 ? "#065f46" : ai === 1 ? "#1e40af" : "#92400e"} size={28} />
                      ))}
                    </div>
                    <div style={{ width: 19, height: 19, borderRadius: "50%", background: "#eab308", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {m.unread ?? 4}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Upcoming Live Sessions (replaces static meetings) ── */}
            <div style={{ border: "1.5px solid #14b8a6", borderRadius: 14, overflow: "hidden", background: "#fcfaf2" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #14b8a6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <DotLabel color="#e74c3c">Upcoming sessions</DotLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {liveSessions.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#16a34a" }}>
                      {liveSessions.length} live
                    </span>
                  )}
                  <ViewAllBtn />
                </div>
              </div>
              <LiveSessionsPanel
                sessions={liveSessions}
                loading={sessionsLoading}
                onRsvpChange={handleRsvpChange}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
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