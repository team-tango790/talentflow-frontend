// components/modules.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import ModuleCard from "@/components/ModuleCard";
import CourseDescription from "@/components/CourseDescription";
import { TimerIcon, BookOpen, PlaySquareIcon } from "lucide-react";
import { Module, Resource } from "@/types/course";
import { BASE_URL, getHeaders, safeJson } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface ModulesProps {
  courseId: string;
}

interface LiveSession {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  duration: number;
  platform: "ZOOM" | "YOUTUBE" | "GOOGLE_MEET" | "OTHER";
  platformUrl?: string | null;
  capacity?: number | null;
  isActive: boolean;
  mentor?: { id: string; name: string; profilePhoto?: string | null };
  _count?: { rsvps: number };
  userHasRsvp?: boolean;
}

interface LessonWithProgress {
  id: string;
  title: string;
  type: string;
  videoUrl?: string | null;
  duration?: number;
  order: number;
  isCompleted?: boolean;
}

interface ModuleWithProgress extends Omit<Module, "lessons"> {
  lessons: LessonWithProgress[];
}

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function formatSessionDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diffMs < 0) return { label: `${dateLabel} · ${time}`, isToday: false, isPast: true };
  if (diffDays === 0) return { label: `Today · ${time}`, isToday: true, isPast: false };
  if (diffDays === 1) return { label: `Tomorrow · ${time}`, isToday: false, isPast: false };
  return { label: `${dateLabel} · ${time}`, isToday: false, isPast: false };
}

function getPlatformIcon(platform: string) {
  if (platform === "ZOOM") return "🎥";
  if (platform === "GOOGLE_MEET") return "📹";
  if (platform === "YOUTUBE") return "▶️";
  return "🔗";
}

function getPlatformLabel(platform: string) {
  if (platform === "ZOOM") return "Zoom";
  if (platform === "GOOGLE_MEET") return "Google Meet";
  if (platform === "YOUTUBE") return "YouTube Live";
  return "Online";
}

/* ════════════════════════════════════
   SESSION CARD
════════════════════════════════════ */
function SessionCard({ session, onRsvpChange }: {
  session: LiveSession;
  onRsvpChange: (sessionId: string, hasRsvp: boolean) => void;
}) {
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const { label, isToday, isPast } = formatSessionDate(session.scheduledAt);

  const handleRsvp = async () => {
    setRsvpLoading(true);
    try {
      if (session.userHasRsvp) {
        await fetch(`${BASE_URL}/api/live-sessions/${session.id}/rsvp`, {
          method: "DELETE", headers: getHeaders(),
        });
        onRsvpChange(session.id, false);
      } else {
        const res = await fetch(`${BASE_URL}/api/live-sessions/${session.id}/rsvp`, {
          method: "POST", headers: getHeaders(),
        });
        if (!res.ok) {
          const err = await safeJson<{ message?: string }>(res);
          alert(err?.message ?? "Could not RSVP. Make sure you are enrolled in this course.");
          return;
        }
        onRsvpChange(session.id, true);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRsvpLoading(false);
    }
  };

  const addToCalendar = () => {
    const start = new Date(session.scheduledAt);
    const end = new Date(start.getTime() + session.duration * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(session.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(session.description ?? session.title)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{
      border: "1px solid",
      borderColor: isToday ? "#bbf7d0" : isPast ? "#e5e7eb" : "#d1fae5",
      borderLeft: `3px solid ${isToday ? "#16a34a" : isPast ? "#d1d5db" : "#1E4A39"}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 10,
      background: isToday ? "#f0fdf4" : isPast ? "#fafafa" : "#fff",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span>{getPlatformIcon(session.platform)}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: isToday ? "#dcfce7" : isPast ? "#f3f4f6" : "#e8f4ee",
              color: isToday ? "#16a34a" : isPast ? "#9ca3af" : "#1E4A39",
              textTransform: "uppercase" as const, letterSpacing: "0.06em",
            }}>
              {isToday ? "Live Today" : isPast ? "Past" : "Upcoming"}
            </span>
            {session.userHasRsvp && !isPast && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#eff6ff", color: "#2563eb" }}>
                ✓ RSVP&apos;d
              </span>
            )}
          </div>

          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4, lineHeight: 1.4 }}>
            {session.title}
          </p>
          {session.description && (
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, lineHeight: 1.5 }}>{session.description}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "#6b7280" }}>
            <span>⏱ {session.duration} min</span>
            <span>📺 {getPlatformLabel(session.platform)}</span>
            {session.mentor && <span>👤 {session.mentor.name}</span>}
            {session._count !== undefined && <span>👥 {session._count.rsvps} RSVPs</span>}
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>{label}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {isToday && session.platformUrl && (
            <a href={session.platformUrl} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#1E4A39", color: "white", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              Join now
            </a>
          )}
          {!isPast && (
            <button onClick={handleRsvp} disabled={rsvpLoading}
              style={{
                padding: "7px 14px", borderRadius: 8,
                border: `1.5px solid ${session.userHasRsvp ? "#fca5a5" : "#1E4A39"}`,
                background: session.userHasRsvp ? "#fef2f2" : "transparent",
                color: session.userHasRsvp ? "#dc2626" : "#1E4A39",
                fontSize: 12, fontWeight: 600, cursor: rsvpLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 88,
              }}>
              {rsvpLoading
                ? <span style={{ width: 10, height: 10, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                : session.userHasRsvp ? "Cancel RSVP" : "RSVP"
              }
            </button>
          )}
          {!isPast && (
            <button onClick={addToCalendar}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
              + Calendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN COMPONENT — receives courseId as prop
════════════════════════════════════ */
export default function Modules({ courseId }: ModulesProps) {
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"modules" | "description">("modules");
  const [description, setDescription] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  // ── Load modules + enrich with lesson progress ──
  useEffect(() => {
    if (!courseId) return;
    const headers = getHeaders();

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [modulesRes, overviewRes] = await Promise.all([
          fetch(`${BASE_URL}/api/courses/${courseId}/modules`, { headers }),
          fetch(`${BASE_URL}/api/courses/${courseId}/overview`, { headers }),
        ]);

        if (!modulesRes.ok) throw new Error("Failed to fetch modules");
        if (!overviewRes.ok) throw new Error("Failed to fetch course overview");

        const modulesJson = await modulesRes.json();
        const overviewJson = await overviewRes.json();

        const rawModules: Module[] = modulesJson?.data ?? [];
        setResources(overviewJson?.data?.resources ?? []);
        setDescription(overviewJson?.data?.description ?? "");
        setCourseTitle(overviewJson?.data?.title ?? "");

        // Enrich each module with per-lesson completion status
        const enriched = await Promise.all(
          rawModules.map(async (mod) => {
            try {
              const progressRes = await fetch(
                `${BASE_URL}/api/modules/${mod.id}/progress`, { headers }
              );
              if (!progressRes.ok) return { ...mod, lessons: mod.lessons ?? [] } as ModuleWithProgress;

              const progressJson = await progressRes.json();
              const lessonStatuses: { id: string; isCompleted: boolean }[] =
                progressJson?.data?.lessons ?? [];
              const completedIds = new Set(
                lessonStatuses.filter(l => l.isCompleted).map(l => l.id)
              );

              return {
                ...mod,
                lessons: (mod.lessons ?? []).map(lesson => ({
                  ...lesson,
                  isCompleted: completedIds.has(lesson.id),
                })),
              } as ModuleWithProgress;
            } catch {
              return { ...mod, lessons: mod.lessons ?? [] } as ModuleWithProgress;
            }
          })
        );

        setModules(enriched);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  // ── Load live sessions for this course ──
  const loadSessions = useCallback(async () => {
    if (!courseId) return;
    setSessionsLoading(true);
    try {
      const overviewRes = await fetch(
        `${BASE_URL}/api/courses/${courseId}/overview`,
        { headers: getHeaders() }
      );
      if (!overviewRes.ok) { setSessionsLoading(false); return; }
      const overviewJson = await overviewRes.json();
      const sessionIds: string[] =
        overviewJson?.data?.liveSessionIds ??
        overviewJson?.data?.upcomingSessions ?? [];

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
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      setLiveSessions(sessions);
    } catch {
      // sessions are optional — fail silently
    } finally {
      setSessionsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleRsvpChange = (sessionId: string, hasRsvp: boolean) => {
    setLiveSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, userHasRsvp: hasRsvp } : s)
    );
  };

  const handleMarkComplete = async (lessonId: string) => {
    try {
      await fetch(`${BASE_URL}/api/lessons/${lessonId}/complete`, {
        method: "POST", headers: getHeaders(),
      });
      setModules(prev =>
        prev.map(mod => ({
          ...mod,
          lessons: mod.lessons.map(l =>
            l.id === lessonId ? { ...l, isCompleted: true } : l
          ),
        }))
      );
    } catch { /* ignore */ }
  };

  // ── Derived ──
  const toYouTubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  const isDirectVideoFile = (url?: string | null) =>
    url ? /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) : false;

  const firstVideoLesson = modules.flatMap(m => m.lessons).find(l => l.type === "VIDEO" && l.videoUrl);
  const embedUrl = toYouTubeEmbedUrl(firstVideoLesson?.videoUrl);
  const directVideoUrl = isDirectVideoFile(firstVideoLesson?.videoUrl) ? firstVideoLesson?.videoUrl : null;
  const totalDurationMinutes = modules.flatMap(m => m.lessons).reduce((s, l) => s + (l.duration ?? 0), 0);
  const hasVideos = modules.some(m => m.lessons.some(l => l.type === "VIDEO"));
  const hasDocuments = modules.some(m => m.lessons.some(l => l.type === "ARTICLE"));
  const completedCount = modules.flatMap(m => m.lessons).filter(l => l.isCompleted).length;
  const totalCount = modules.flatMap(m => m.lessons).length;
  const upcomingSessions = liveSessions.filter(s => new Date(s.scheduledAt) > new Date());
  const pastSessions = liveSessions.filter(s => new Date(s.scheduledAt) <= new Date());

  return (
    <div className="mt-10">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[3fr_2fr]">

        {/* ── Left panel ── */}
        <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
          <div className="p-5">
            {embedUrl ? (
              <iframe src={embedUrl} title={firstVideoLesson?.title || "Course video"}
                className="w-full rounded-lg aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            ) : directVideoUrl ? (
              <video src={directVideoUrl} controls autoPlay muted loop className="w-full rounded-lg" />
            ) : (
              <div className="w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                No video available
              </div>
            )}

            <div className="max-w-4xl mx-auto pt-5">
              <h1 className="text-3xl font-semibold text-gray-800 py-4">{courseTitle}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <div className="bg-[#E6F6F6] rounded-sm p-1.5"><TimerIcon size={18} className="text-[#83C0C0]" /></div>
                  {totalDurationMinutes} mins total
                </span>
                <span className="flex items-center gap-1">
                  <div className="bg-[#FEF5E6] rounded-sm p-1.5"><BookOpen size={18} className="text-[#D08933]" /></div>
                  {modules.length} modules
                </span>
                <span className="flex items-center gap-1">
                  <div className="bg-[#F8E9C7] rounded-sm p-1.5"><PlaySquareIcon size={18} className="text-[#E9BC55]" /></div>
                  {hasVideos ? "Contains videos" : "No videos"}
                </span>
                <span className="flex items-center gap-1">
                  <div className="bg-[#F8E9C7] rounded-sm p-1.5"><PlaySquareIcon size={18} className="text-[#E9BC55]" /></div>
                  {hasDocuments ? "Contains documents" : "No documents"}
                </span>
              </div>

              {/* Overall lesson progress */}
              {totalCount > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{completedCount} of {totalCount} lessons completed</span>
                    <span className="font-medium text-[#1E4A39]">
                      {Math.round((completedCount / totalCount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.round((completedCount / totalCount) * 100)}%`,
                        background: completedCount === totalCount ? "#16a34a" : "#1E4A39",
                      }}
                    />
                  </div>
                </div>
              )}

              <button className="mb-8 rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white hover:scale-105 cursor-pointer transition-all duration-200">
                {completedCount > 0 ? "Continue learning" : "Start learning"}
              </button>
            </div>

            <div className="flex gap-6 mb-4">
              <button onClick={() => setActiveTab("modules")}
                className={`pb-1 font-medium cursor-pointer ${activeTab === "modules" ? "border-b-4 border-[#1F8A8A] text-gray-800" : "text-gray-500"}`}>
                Modules
              </button>
              <button onClick={() => setActiveTab("description")}
                className={`pb-1 font-medium cursor-pointer ${activeTab === "description" ? "border-b-4 border-[#1F8A8A] text-gray-800" : "text-gray-500"}`}>
                Course description
              </button>
            </div>

            {activeTab === "modules" && (
              <>
                {loading && <p className="p-4 text-sm text-gray-500">Loading modules...</p>}
                {error && <p className="p-4 text-sm text-red-500">{error}</p>}
                {!loading && !error && modules.length === 0 && (
                  <p className="p-4 text-sm text-gray-500">No modules found.</p>
                )}
                {!loading && !error && modules.map((module) => (
                  <ModuleCard key={module.id} module={module} onMarkComplete={handleMarkComplete} />
                ))}
              </>
            )}

            {activeTab === "description" && (
              <div className="border border-[#1F8A8A] rounded-lg overflow-hidden mt-5">
                {description
                  ? <CourseDescription description={description} />
                  : <p className="p-4 text-sm text-gray-500">No description available.</p>
                }
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-6">

          {/* Resources */}
          <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
            <h2 className="py-4 border-b border-[#1F8A8A] px-5 text-lg font-semibold flex items-center gap-2 text-gray-800">
              <div className="p-1.5 me-1 rounded-full bg-[#E4AE2F]" />
              Learning Resources
            </h2>
            <div>
              {loading && <p className="p-4 text-sm text-gray-500">Loading resources...</p>}
              {!loading && resources.length === 0 && (
                <p className="p-4 text-sm text-gray-500">No resources available.</p>
              )}
              {resources.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#1F8A8A] bg-white py-3 px-5 my-4 mx-4 space-x-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-[#E4AE2F]">{item.type}</p>
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm bg-[#1E4A39] text-white px-4 py-2 min-w-20 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200 text-center">
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Live Sessions */}
          <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
            <div className="py-4 border-b border-[#1F8A8A] px-5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                <div className="p-1.5 rounded-full bg-emerald-600" />
                <h2>Live sessions</h2>
              </div>
              {upcomingSessions.length > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {upcomingSessions.length} upcoming
                </span>
              )}
            </div>

            <div className="p-4">
              {sessionsLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span style={{ width: 14, height: 14, border: "2px solid #d1fae5", borderTopColor: "#1E4A39", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Loading sessions...
                </div>
              )}
              {!sessionsLoading && liveSessions.length === 0 && (
                <div className="py-8 text-center">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                  <p className="text-sm text-gray-500">No sessions scheduled yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your mentor will add sessions here</p>
                </div>
              )}
              {!sessionsLoading && upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} onRsvpChange={handleRsvpChange} />
              ))}
              {!sessionsLoading && pastSessions.length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none py-1">
                    {pastSessions.length} past session{pastSessions.length !== 1 ? "s" : ""}
                  </summary>
                  <div className="mt-2" style={{ opacity: 0.6 }}>
                    {pastSessions.map(session => (
                      <SessionCard key={session.id} session={session} onRsvpChange={handleRsvpChange} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}