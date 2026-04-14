"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/sidebar";
import { getDashboard } from "@/lib/api";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Study Activity Chart (Dynamic) ──────────────────────────────────────────
const StudyChart = ({ activityData }: { activityData: any[] }) => {
  const days = activityData.map((d: any) =>
    new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
  );
  const bars = activityData.map((d: any) => d.lessonsCompleted);
  const lineVals = activityData.map((d: any) => d.hoursSpent ?? 0);

  const barMax = Math.max(...bars, 60);
  const lineMax = Math.max(...lineVals, 6);
  const W = 500;
  const H = 300;
  const padL = 50;
  const padR = 50;
  const padT = 20;
  const padB = 40;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = chartW / days.length;
  const barGap = 20;

  const getBx = (i: number) => padL + i * barW + barGap / 2;
  const getBy = (v: number) => padT + chartH - (v / barMax) * chartH;
  const getLx = (i: number) => padL + i * barW + barW / 2;
  const getLy = (v: number) => padT + chartH - (v / lineMax) * chartH;

  const linePoints = lineVals.map((v: number, i: number) => `${getLx(i)},${getLy(v)}`).join(" ");
  const yBarLabels = Array.from({ length: 7 }, (_, i) => Math.round((barMax / 6) * i));
  const yLineLabels = Array.from({ length: 7 }, (_, i) => Math.round((lineMax / 6) * i));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {yBarLabels.map((v, idx) => (
        <line key={idx} x1={padL} y1={getBy(v)} x2={W - padR} y2={getBy(v)} stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {yBarLabels.map((v, idx) => (
        <text key={idx} x={padL - 15} y={getBy(v) + 5} textAnchor="end" fontSize="12" fill="#9ca3af">{v}</text>
      ))}
      {yLineLabels.map((v, idx) => (
        <text key={idx} x={W - padR + 15} y={getLy(v) + 5} textAnchor="start" fontSize="12" fill="#9ca3af">{v}</text>
      ))}
      {bars.map((v, i) => (
        <rect
          key={i}
          x={getBx(i)}
          y={getBy(v)}
          width={barW - barGap}
          height={chartH - (getBy(v) - padT)}
          fill="#b7e4d0"
          rx="2"
        />
      ))}
      <polyline points={linePoints} fill="none" stroke="#e9b036" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {lineVals.map((v, i) => (
        <circle key={i} cx={getLx(i)} cy={getLy(v)} r="6" fill="#e9b036" />
      ))}
      {days.map((d, i) => (
        <text key={i} x={getLx(i)} y={H - 5} textAnchor="middle" fontSize="13" fill="#9ca3af">{d}</text>
      ))}
    </svg>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = "#52b788" }: { value: number; color?: string }) => (
  <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6, width: "100%" }}>
    <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
  </div>
);

// ─── Stat Card Icons ──────────────────────────────────────────────────────────
const BookOpenIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const FolderIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const AwardIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const MonitorIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ number, label, sublabel, color, icon }: any) => (
  <div style={{ flex: 1, background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 12, padding: "18px 20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>{number}</span>
      <span style={{ background: color + "18", color: color, borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </span>
    </div>
    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{label}</div>
    {sublabel && <div style={{ fontSize: 11, color: color, cursor: "pointer" }}>{sublabel}</div>}
  </div>
);

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#fff", border: "1.5px solid #2dd4bf", borderRadius: 14, padding: "20px", ...style }}>
    {children}
  </div>
);

const ViewAllBtn = () => (
  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "black", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
    View all <ArrowRightIcon />
  </button>
);

// ─── Avatar Circle ────────────────────────────────────────────────────────────
const Avatar = ({ initials, bg, color }: { initials: string; bg: string; color: string }) => (
  <div style={{
    width: 36, height: 36, borderRadius: "50%", background: bg, color: color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 600, flexShrink: 0
  }}>
    {initials}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getDashboard();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 18, fontFamily: "'DM Sans', sans-serif", color: "#6b7280" }}>
      Loading...
    </div>
  );

  // ─── Fallback Data ────────────────────────────────────────────────────────
  const defaultMessages = [
    { sender: "Team tango", initials: "TT", avatarBg: "#d1fae5", avatarColor: "#065f46", text: "Favour: Hi guys, please be reminded of our meeting later today, avail yourself as we will be reviewing the projects milestone!", time: "2:30pm" },
    { sender: "John Doe", initials: "JD", avatarBg: "#dbeafe", avatarColor: "#1e40af", text: "Hi Farida, I have just graded your assignments and let you some feedbacks, please pay close attention to the highlighted feedbacks.", time: "2:30pm" },
    { sender: "Team tango", initials: "TT", avatarBg: "#d1fae5", avatarColor: "#065f46", text: "Favour: Hi guys, please be reminded of our meeting later today, avail yourself as we will be reviewing the projects milestone!", time: "2:30pm" },
    { sender: "John Doe", initials: "JD", avatarBg: "#dbeafe", avatarColor: "#1e40af", text: "Hi Farida, I have just graded your assignments and let you some feedbacks, please pay close attention to the highlighted feedbacks.", time: "2:30pm" },
  ];

  const defaultMeetings = [
    { title: "Team call: Discuss BRD document", boldPart: undefined, badgeBg: "#fde8e8", badgeColor: "#a32d2d", badgeText: "Today 4:00PM GMT", barColor: "#e74c3c" },
    { title: "Live class: Laws of design", boldPart: "Laws of design", badgeBg: "#fef9e7", badgeColor: "#b8860b", badgeText: "April 9th 2026", barColor: "#e6ac25" },
    { title: "Live call: Milestone 1 review", boldPart: "Milestone 1 review", badgeBg: "#e8f5ef", badgeColor: "#2d6a4f", badgeText: "May 3rd 2026", barColor: "#52b788" },
    { title: "Live class: Design system", boldPart: "Design system", badgeBg: "#e6fffa", badgeColor: "#0c8577", badgeText: "June 10th 2026", barColor: "#14b8a6" },
  ];

  const displayMessages = (data?.messages && data.messages.length > 0) ? data.messages : defaultMessages;
  const displayMeetings = (data?.meetings && data.meetings.length > 0) ? data.meetings : defaultMeetings;
  const activityData = data?.studyActivity ?? [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f0e8", fontFamily: "'DM Sans', sans-serif" }}>
      <SideBar />

      <main style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Top Nav ── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 28px", background: "#f0f0e8", borderBottom: "1px solid #e2e2d8",
          position: "sticky", top: 0, zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #2dd4bf", borderRadius: 20, padding: "8px 16px", width: 260 }}>
            <SearchIcon />
            <input placeholder="Search courses, lessons, projects" style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#6b7280", width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <UserIcon /><BellIcon />
          </div>
        </header>

        <div style={{ padding: "28px 28px" }}>

          {/* ── Welcome (Dynamic) ── */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Welcome back, {data?.user?.name}
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0" }}>
              Here's what's happening with your learning journey today
            </p>
          </div>

          {/* ── Stat Cards (Dynamic) ── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <StatCard
              number={`${data?.stats?.gradePointAverage ?? 0}%`}
              label="Grade Point average"
              sublabel="↑+5% this week"
              color="#f4a261"
              icon={<BookOpenIcon color="#f4a261" />}
            />
            <StatCard
              number={data?.stats?.completedModules ?? 0}
              label="Completed module"
              sublabel="↑ 2 this month"
              color="#ee380a"
              icon={<FolderIcon color="#ee380a" />}
            />
            <StatCard
              number={`${data?.stats?.totalStudyTimeHours ?? 0}hrs`}
              label="Total Study time"
              sublabel="↑ 2 this month"
              color="#008080"
              icon={<AwardIcon color="#008080" />}
            />
            <StatCard
              number={data?.stats?.cohortLevel ?? "1"}
              label="Cohort Level"
              sublabel="85% grade point to get to next level"
              color="#E1AD01"
              icon={<MonitorIcon color="#E1AD01" />}
            />
          </div>

          {/* ── Middle Row: Course + Chart ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, marginBottom: 20 }}>

            {/* Currently Enrolled (Dynamic) */}
            <div style={{ border: "1.5px solid #2dd4bf", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "#1a3328", padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "#E1AD01", marginBottom: 4 }}>Currently enrolled ↗</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                  {data?.activeEnrollment?.course?.title}
                </div>
                <div style={{ fontSize: 12, color: "#E1AD01" }}>
                  {data?.activeEnrollment?.course?.totalModules} modules · {data?.activeEnrollment?.course?.level}
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, color: "#fff", marginBottom: 6 }}>
                    {data?.activeEnrollment?.progress}%
                  </div>
                  <ProgressBar value={data?.activeEnrollment?.progress ?? 0} color="#74c69d" />
                  <div style={{ fontSize: 11, color: "#E1AD01", marginTop: 4 }}>Overall completion</div>
                </div>
              </div>

              <div style={{ padding: "16px 20px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>Course progress</div>
                    <div style={{ fontSize: 11, color: "#1a1b1b" }}>
                      {data?.stats?.completedModules} of {data?.activeEnrollment?.course?.totalModules} modules
                    </div>
                  </div>
                  <ViewAllBtn />
                </div>

                {/* Course Progress Modules (Dynamic) */}
                {data?.courseProgressList?.map((module: any, i: number) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#374151" }}>{module.moduleTitle}</span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {module.completedCount}/{module.totalCount}
                      </span>
                    </div>
                    <ProgressBar
                      value={module.totalCount > 0 ? (module.completedCount / module.totalCount) * 100 : 0}
                      color="#E3B448"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Study Activity Chart (Dynamic) */}
            <Card style={{ padding: 0, background: "#fcfaf2", border: "1px solid #14b8a6", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #14b8a6", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0c5239" }} />
                <span style={{ fontWeight: 700, fontSize: 18, color: "#1f2937" }}>Study activity</span>
              </div>
              <div style={{ padding: "30px 20px" }}>
                {activityData.length > 0 ? (
                  <StudyChart activityData={activityData} />
                ) : (
                  <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    No activity data available
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4b5563" }}>
                    <span style={{ width: 35, height: 18, borderRadius: 3, background: "#b7e4d0", display: "inline-block" }} />
                    Module completed
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4b5563" }}>
                    <span style={{ width: 35, height: 18, borderRadius: 3, background: "#e9b036", display: "inline-block" }} />
                    Time spent
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Bottom Row: Messages + Meetings ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

            {/* New Messages */}
            <Card style={{ padding: 0, overflow: "hidden", border: "1.5px solid #14b8a6", borderRadius: 14 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #14b8a6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfaf2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0c8577", display: "inline-block" }} />
                  <span style={{ fontWeight: 700, fontSize: 18, color: "#374151" }}>New messages</span>
                </div>
                <ViewAllBtn />
              </div>

              {displayMessages.map((m: any, i: number) => (
                <div key={i} style={{ padding: "18px 20px", background: "#fcfaf2", borderBottom: "1.5px solid #14b8a6", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>{m.sender}</span>
                    <span style={{ fontSize: 10, color: "#4b5563", fontWeight: 500 }}>Today {m.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#4b5563", lineHeight: "1.5", marginBottom: 12, paddingRight: "10px" }}>
                    {m.text}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Avatar initials={m.initials} bg={m.avatarBg} color={m.avatarColor} />
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#eab308", color: "white", fontSize: 10, fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      4
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Upcoming Meetings */}
            <Card style={{ padding: 0, overflow: "hidden", border: "1.5px solid #14b8a6", borderRadius: 14, background: "#fcfaf2", maxWidth: 450 }}>
              <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #14b8a6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} />
                  <span style={{ fontWeight: 700, fontSize: 18, color: "#374151", letterSpacing: "-0.01em" }}>Upcoming meetings</span>
                </div>
                <ViewAllBtn />
              </div>

              {displayMeetings.map((meeting: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1.5px solid #14b8a6", position: "relative" }}>
                  <div style={{ width: 5, height: 40, background: meeting.barColor, borderRadius: 4, marginRight: 16, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: "#4b5563", marginBottom: 8 }}>
                      {meeting.boldPart ? meeting.title.split(meeting.boldPart)[0] : meeting.title}
                      {meeting.boldPart && (
                        <span style={{ fontWeight: 700, color: "#1f2937" }}>{meeting.boldPart}</span>
                      )}
                    </div>
                    <div style={{ display: "inline-block", background: meeting.badgeBg, color: meeting.badgeColor, fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "capitalize" }}>
                      {meeting.badgeText}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}