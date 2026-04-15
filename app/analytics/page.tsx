// app/analytics/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import SideBar from "@/components/sidebar";
import { getMyAnalytics, getMyModulePerformance, getMyStudyOvertimeAnalytics } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface AnalyticsSnapshot {
    user?: { name: string; internId?: string; track?: string };
    stats?: {
        completedLessons?: number;
        totalStudyHours?: number;
        totalStudyMinutes?: number;
        assignmentScoreAvg?: number;
        currentStreak?: number;
        longestStreak?: number;
        overallGpa?: number;
        overallProgress?: number;
        completedCourses?: number;
        certificates?: number;
    };
    enrollments?: {
        courseId: string;
        courseTitle?: string;
        progress: number;
        averageGrade?: number | null;
        status: string;
    }[];
}

interface ModulePerf {
    moduleId?: string;
    moduleTitle?: string;
    title?: string;
    completedLessons?: number;
    totalLessons?: number;
    progress?: number;
    avgAssignmentScore?: number | null;
}

interface StudyPoint {
    period?: string;
    date?: string;
    hours?: number;
    hoursSpent?: number;
    lessonsCompleted?: number;
}

type Period = "daily" | "weekly" | "monthly";

/* ════════════════════════════════════
   SMALL COMPONENTS
════════════════════════════════════ */
const StatCard = ({
    value, label, sub, icon, color,
}: {
    value: string | number;
    label: string;
    sub?: string;
    icon: string;
    color: string;
}) => (
    <div style={{
        background: "#fff", borderRadius: 14, padding: "20px 22px",
        border: "1.5px solid #e8eeec", flex: 1,
        display: "flex", flexDirection: "column", gap: 10,
    }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#112920", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
        </div>
    </div>
);

const ProgressBar = ({ value, color = "#112920" }: { value: number; color?: string }) => (
    <div style={{ background: "#f0f0e8", borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
);

const Skeleton = ({ h = 16, w = "100%" }: { h?: number; w?: string | number }) => (
    <div style={{ height: h, width: w, borderRadius: 6, background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
);

/* ════════════════════════════════════
   STUDY CHART
════════════════════════════════════ */
function StudyOvertimeChart({ data }: { data: StudyPoint[] }) {
    if (!data.length) return (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
            No study data yet. Start learning to see your chart!
        </div>
    );

    const labels = data.map((d) => d.period ?? (d.date ? new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }) : "—"));
    const values = data.map((d) => d.hours ?? d.hoursSpent ?? 0);
    const maxVal = Math.max(...values, 1);

    const W = 560; const H = 200;
    const padL = 36; const padR = 20; const padT = 16; const padB = 32;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const slotW = chartW / labels.length;

    const getX = (i: number) => padL + i * slotW + slotW / 2;
    const getY = (v: number) => padT + chartH - (v / maxVal) * chartH;

    const pathD = values.map((v, i) => `${i === 0 ? "M" : "L"}${getX(i)},${getY(v)}`).join(" ");

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                const yPos = padT + chartH * (1 - frac);
                return (
                    <g key={i}>
                        <line x1={padL} y1={yPos} x2={W - padR} y2={yPos} stroke="#f0f0e8" strokeWidth="1" />
                        <text x={padL - 6} y={yPos + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {(maxVal * frac).toFixed(1)}h
                        </text>
                    </g>
                );
            })}
            <path d={pathD} fill="none" stroke="#112920" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Area fill */}
            <path
                d={`${pathD} L${getX(values.length - 1)},${padT + chartH} L${getX(0)},${padT + chartH} Z`}
                fill="url(#areaGrad)" opacity="0.15"
            />
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#112920" />
                    <stop offset="100%" stopColor="#112920" stopOpacity="0" />
                </linearGradient>
            </defs>
            {values.map((v, i) => (
                <circle key={i} cx={getX(i)} cy={getY(v)} r="4" fill="#E9BD55" stroke="#fff" strokeWidth="2" />
            ))}
            {labels.map((l, i) => (
                <text key={i} x={getX(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">{l}</text>
            ))}
        </svg>
    );
}

/* ════════════════════════════════════
   MAIN ANALYTICS PAGE
════════════════════════════════════ */
export default function Analytics() {
    const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
    const [modulePerf, setModulePerf] = useState<ModulePerf[]>([]);
    const [studyData, setStudyData] = useState<StudyPoint[]>([]);
    const [period, setPeriod] = useState<Period>("weekly");
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Load snapshot + module performance ──
    const loadMain = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [snapRes, modRes] = await Promise.all([
                getMyAnalytics(),
                getMyModulePerformance(),
            ]);
            setSnapshot(snapRes?.data ?? snapRes ?? {});
            const rawModPerf = modRes?.data ?? modRes ?? [];
            setModulePerf(Array.isArray(rawModPerf) ? rawModPerf : []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Load study overtime chart ──
    const loadChart = useCallback(async (p: Period) => {
        setChartLoading(true);
        try {
            const res = await getMyStudyOvertimeAnalytics(p);
            setStudyData(res?.data ?? []);
        } catch {
            setStudyData([]);
        } finally {
            setChartLoading(false);
        }
    }, []);

    useEffect(() => { loadMain(); }, [loadMain]);
    useEffect(() => { loadChart(period); }, [loadChart, period]);

    const stats = snapshot?.stats;
    const enrollments = snapshot?.enrollments ?? [];
    const userName = snapshot?.user?.name ?? "—";

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .period-btn { padding: 8px 18px; border-radius: 20px; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .period-btn.active { background: #112920; color: white; }
        .period-btn:not(.active) { background: white; color: #7a9a91; border: 1px solid #e0e8e4; }
        .period-btn:not(.active):hover { background: #f0f4f2; color: #112920; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #c8d8d2; border-radius: 10px; }
      `}</style>

            <SideBar />

            <main style={{ flex: 1, overflowY: "auto" }}>
                {/* Header */}
                <header style={{ padding: "16px 32px", background: "white", borderBottom: "1px solid #e8eeec", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f0", borderRadius: 8, padding: "8px 14px", border: "1px solid #e0e8e4", width: 300 }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="#9ca3af" strokeWidth="1.8" />
                            <path d="M14 14l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <input placeholder="Search courses, lessons, projects" style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#112920", width: "100%" }} />
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8" /></svg>
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                </header>

                <div style={{ padding: "32px 36px" }}>
                    {/* Page title */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 4 }}>
                            Analytics
                        </h1>
                        <p style={{ color: "#7a9a91", fontSize: 14 }}>
                            {loading ? "Loading your data…" : `Track your progress, ${userName}`}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: "#fff2f2", border: "1px solid #fcd0cc", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#c0392b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>⚠ {error}</span>
                            <button onClick={loadMain} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", fontWeight: 600, fontSize: 13 }}>Retry</button>
                        </div>
                    )}

                    {/* ── Stats Cards ── */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e8eeec" }}>
                                    <Skeleton h={40} w={40} /><div style={{ marginTop: 14 }}><Skeleton h={28} w={80} /></div>
                                    <div style={{ marginTop: 8 }}><Skeleton h={13} w="70%" /></div>
                                </div>
                            ))
                        ) : (
                            <>
                                <StatCard
                                    value={stats?.completedLessons ?? 0}
                                    label="Lessons completed"
                                    sub={`↑ This week`}
                                    icon="📚"
                                    color="#112920"
                                />
                                <StatCard
                                    value={`${stats?.totalStudyHours ?? 0}h`}
                                    label="Total study hours"
                                    sub={`Streak: ${stats?.currentStreak ?? 0} days`}
                                    icon="⏱️"
                                    color="#E9BD55"
                                />
                                <StatCard
                                    value={`${stats?.assignmentScoreAvg ?? 0}%`}
                                    label="Assignment average"
                                    sub="Across all submissions"
                                    icon="📝"
                                    color="#14b8a6"
                                />
                                <StatCard
                                    value={`${stats?.overallGpa ?? 0}%`}
                                    label="Grade point average"
                                    sub={`${stats?.completedCourses ?? 0} course(s) completed`}
                                    icon="🎯"
                                    color="#f4a261"
                                />
                            </>
                        )}
                    </div>

                    {/* ── Study Hours Chart + Module Performance ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 24 }}>

                        {/* Study Hours Chart */}
                        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e8eeec", overflow: "hidden" }}>
                            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f0e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#112920" }}>Study hours</div>
                                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Track your daily learning time</div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
                                        <button
                                            key={p}
                                            className={`period-btn${period === p ? " active" : ""}`}
                                            onClick={() => setPeriod(p)}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: "20px 24px" }}>
                                {chartLoading ? (
                                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <div style={{ width: 28, height: 28, border: "2.5px solid #d8e8e2", borderTopColor: "#112920", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                    </div>
                                ) : (
                                    <StudyOvertimeChart data={studyData} />
                                )}
                            </div>
                        </div>

                        {/* Module Performance */}
                        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e8eeec", overflow: "hidden" }}>
                            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f0e8" }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#112920" }}>Module performance</div>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Progress per module</div>
                            </div>
                            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                                {loading ? (
                                    [1, 2, 3, 4].map((i) => <div key={i}><Skeleton h={13} w="70%" /><div style={{ marginTop: 8 }}><Skeleton h={6} /></div></div>)
                                ) : modulePerf.length === 0 ? (
                                    <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                                        Complete some lessons to see module performance
                                    </div>
                                ) : (
                                    modulePerf.map((m, i) => {
                                        const pct = m.progress ?? 0;
                                        const score = m.avgAssignmentScore;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                                                        {m.moduleTitle ?? m.title ?? `Module ${i + 1}`}
                                                    </span>
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                        {score != null && (
                                                            <span style={{ fontSize: 11, color: "#7a9a91" }}>
                                                                {score}% avg
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{pct}%</span>
                                                    </div>
                                                </div>
                                                <ProgressBar
                                                    value={pct}
                                                    color={pct === 100 ? "#14b8a6" : pct >= 50 ? "#E9BD55" : "#112920"}
                                                />
                                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                                                    {m.completedLessons ?? 0}/{m.totalLessons ?? 0} lessons
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Course Enrollments ── */}
                    {!loading && enrollments.length > 0 && (
                        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e8eeec", overflow: "hidden" }}>
                            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f0e8" }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#112920" }}>Course progress overview</div>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>All enrolled courses</div>
                            </div>
                            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                                {enrollments.map((e, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                <span style={{ fontSize: 14, fontWeight: 500, color: "#112920" }}>
                                                    {e.courseTitle ?? `Course ${i + 1}`}
                                                </span>
                                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                    {e.averageGrade != null && (
                                                        <span style={{ fontSize: 12, color: "#14b8a6", fontWeight: 500 }}>{e.averageGrade}% avg</span>
                                                    )}
                                                    <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 20, background: e.status === "COMPLETED" ? "#f0fdf4" : "#fffbeb", color: e.status === "COMPLETED" ? "#15803d" : "#d97706", fontWeight: 600 }}>
                                                        {e.status === "COMPLETED" ? "Completed" : e.status === "IN_PROGRESS" ? "In progress" : e.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <ProgressBar
                                                value={e.progress}
                                                color={e.status === "COMPLETED" ? "#14b8a6" : "#112920"}
                                            />
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: "#112920", minWidth: 48, textAlign: "right" }}>
                                            {e.progress}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Streak Info ── */}
                    {!loading && (stats?.currentStreak ?? 0) > 0 && (
                        <div style={{ marginTop: 18, background: "linear-gradient(135deg, #112920 0%, #1a4a35 100%)", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>🔥 Current streak</div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: "#E9BD55" }}>{stats?.currentStreak} days</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                                    Best: {stats?.longestStreak ?? 0} days
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Certificates earned</div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>{stats?.certificates ?? 0}</div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
