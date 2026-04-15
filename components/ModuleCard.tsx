"use client";

import { useState, useEffect } from "react";
import { BookOpen, PlaySquareIcon, Lock, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { BASE_URL, getHeaders } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
type Lesson = {
  id: string;
  type: "VIDEO" | "ARTICLE" | string;
  title?: string;
  duration?: number;
  isCompleted?: boolean;
};

type Resource = {
  id: string;
  title: string;
  url: string;
  type: "YOUTUBE" | "ARTICLE" | "DOCUMENT" | "LINK" | string;
  description?: string | null;
  fileSize?: string | null;
  duration?: string | null;
};

type StudyLogEntry = {
  id: string;
  duration: number;
  loggedAt: string;
};

type ModuleCardProps = {
  module: {
    id: string;
    title: string;
    order: number;
    isLocked: boolean;
    lessons: Lesson[];
    totalCount: number;
    completedCount?: number;
  };
  onMarkComplete?: (lessonId: string) => void;
};

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function resourceIcon(type: string) {
  if (type === "YOUTUBE") return "🎥";
  if (type === "DOCUMENT") return "📄";
  if (type === "ARTICLE") return "📰";
  return "🔗";
}

function resourceTypeLabel(type: string) {
  if (type === "YOUTUBE") return "Video";
  if (type === "DOCUMENT") return "Document";
  if (type === "ARTICLE") return "Article";
  return "Link";
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ════════════════════════════════════
   RESOURCE LIST
════════════════════════════════════ */
function ResourceList({ resources, loading }: { resources: Resource[]; loading: boolean }) {
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {[1, 2].map(i => (
        <div key={i} style={{ height: 36, borderRadius: 8, background: "linear-gradient(90deg,#f0f4f2 25%,#e8eeec 50%,#f0f4f2 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
      ))}
    </div>
  );

  if (resources.length === 0) return (
    <p style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>No resources attached</p>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {resources.map(r => (
        <a key={r.id} href={r.url} target="_blank" rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 8, border: "1px solid #e5f0ea", background: "#f9fcfb",
            textDecoration: "none", transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#e8f4ee"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E4A39"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f9fcfb"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e5f0ea"; }}
        >
          <span style={{ fontSize: 15, flexShrink: 0 }}>{resourceIcon(r.type)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#112920", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.title}
            </p>
            <div style={{ display: "flex", gap: 8, fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
              <span>{resourceTypeLabel(r.type)}</span>
              {r.fileSize && <span>· {r.fileSize}</span>}
              {r.duration && <span>· {r.duration}</span>}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ))}
    </div>
  );
}

/* ════════════════════════════════════
   STUDY LOG PANEL
════════════════════════════════════ */
function StudyLogPanel({ lessonId }: { lessonId: string }) {
  const [logs, setLogs] = useState<StudyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lessons/${lessonId}/study-log`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => setLogs(d?.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const totalMinutes = logs.reduce((s, l) => s + l.duration, 0);

  if (loading) return (
    <div style={{ height: 28, borderRadius: 6, background: "linear-gradient(90deg,#f0f4f2 25%,#e8eeec 50%,#f0f4f2 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
  );

  if (logs.length === 0) return (
    <p style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>No study time logged yet</p>
  );

  return (
    <div>
      {/* Summary pill */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "#e8f4ee", marginBottom: 8 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1E4A39" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#1E4A39" }}>
          {formatDuration(totalMinutes)} total · {logs.length} session{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {logs.slice(0, 5).map(entry => (
          <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderRadius: 6, background: "#f9fcfb" }}>
            <span style={{ fontSize: 11, color: "#374151" }}>{formatDuration(entry.duration)}</span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>{timeAgo(entry.loggedAt)}</span>
          </div>
        ))}
        {logs.length > 5 && (
          <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", marginTop: 2 }}>
            +{logs.length - 5} more sessions
          </p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   LESSON ROW
════════════════════════════════════ */
function LessonRow({ lesson, onMarkComplete }: {
  lesson: Lesson;
  onMarkComplete?: (lessonId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lessonResources, setLessonResources] = useState<Resource[]>([]);
  const [lessonResourcesLoading, setLessonResourcesLoading] = useState(false);
  const [lessonResourcesFetched, setLessonResourcesFetched] = useState(false);

  // Load lesson resources + study log when row expands
  useEffect(() => {
    if (!expanded || lessonResourcesFetched) return;
    setLessonResourcesLoading(true);
    setLessonResourcesFetched(true);

    fetch(`${BASE_URL}/api/resources/lesson/${lesson.id}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => setLessonResources(d?.data ?? []))
      .catch(() => setLessonResources([]))
      .finally(() => setLessonResourcesLoading(false));
  }, [expanded, lesson.id, lessonResourcesFetched]);

  return (
    <div style={{ borderBottom: "1px solid #f3f4f6", lastChild: { borderBottom: "none" } } as React.CSSProperties}>
      {/* Row header */}
      <div
        className="lesson-row-header"
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", borderRadius: 8, transition: "background 0.15s" }}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Completion indicator */}
        {lesson.isCompleted
          ? <CheckCircle2 size={15} style={{ color: "#16a34a", flexShrink: 0 }} />
          : <Circle size={15} style={{ color: "#d1d5db", flexShrink: 0 }} />
        }

        {/* Type icon */}
        <span style={{ fontSize: 12, flexShrink: 0 }}>
          {lesson.type === "VIDEO" ? "🎥" : "📄"}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, color: lesson.isCompleted ? "#9ca3af" : "#374151",
            textDecoration: lesson.isCompleted ? "line-through" : "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            fontWeight: lesson.isCompleted ? 400 : 500,
          }}>
            {lesson.title ?? "Untitled lesson"}
          </p>
          <div style={{ display: "flex", gap: 8, fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
            <span>{lesson.type === "VIDEO" ? "Video" : "Article"}</span>
            {lesson.duration ? <span>· {lesson.duration} min</span> : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Mark done — only for incomplete */}
          {!lesson.isCompleted && onMarkComplete && (
            <button
              onClick={e => { e.stopPropagation(); onMarkComplete(lesson.id); }}
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                border: "1px solid #1E4A39", background: "transparent", color: "#1E4A39",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1E4A39"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#1E4A39"; }}
            >
              Mark done
            </button>
          )}

          {/* Expand toggle */}
          {expanded
            ? <ChevronUp size={13} style={{ color: "#9ca3af" }} />
            : <ChevronDown size={13} style={{ color: "#9ca3af" }} />
          }
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ padding: "0 12px 14px 38px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Lesson resources — GET /api/resources/lesson/:lessonId */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Lesson Resources
            </p>
            <ResourceList resources={lessonResources} loading={lessonResourcesLoading} />
          </div>

          {/* Study log — GET /api/lessons/:lessonId/study-log — only for completed */}
          {lesson.isCompleted && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                Study Time
              </p>
              <StudyLogPanel lessonId={lesson.id} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════
   MAIN MODULE CARD
════════════════════════════════════ */
export default function ModuleCard({ module, onMarkComplete }: ModuleCardProps) {
  const [moduleExpanded, setModuleExpanded] = useState(false);
  const [moduleResources, setModuleResources] = useState<Resource[]>([]);
  const [moduleResourcesLoading, setModuleResourcesLoading] = useState(false);
  const [moduleResourcesFetched, setModuleResourcesFetched] = useState(false);

  // Fetch module resources when module section expands
  // GET /api/resources/module/:moduleId
  useEffect(() => {
    if (!moduleExpanded || moduleResourcesFetched || module.isLocked) return;
    setModuleResourcesLoading(true);
    setModuleResourcesFetched(true);

    fetch(`${BASE_URL}/api/resources/module/${module.id}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => setModuleResources(d?.data ?? []))
      .catch(() => setModuleResources([]))
      .finally(() => setModuleResourcesLoading(false));
  }, [moduleExpanded, module.id, module.isLocked, moduleResourcesFetched]);

  const videoCount = module.lessons?.filter(l => l.type === "VIDEO").length ?? 0;
  const articleCount = module.lessons?.filter(l => l.type === "ARTICLE").length ?? 0;
  const totalLessons = module.totalCount ?? module.lessons?.length ?? 0;
  const completedLessons = module.completedCount ?? module.lessons?.filter(l => l.isCompleted).length ?? 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isFullyComplete = completedLessons === totalLessons && totalLessons > 0;

  return (
    <div className={`border-b border-[#1F8A8A] last:border-b-0 bg-white ${module.isLocked ? "opacity-60" : ""}`}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .lesson-row-header:hover { background: #f8fdfb !important; }
      `}</style>

      {/* ── Module header row ── */}
      <div className="flex justify-between items-center p-4">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-sm text-gray-500">Module {module.order}</p>
          <h3 className="font-semibold text-gray-800 mb-2">{module.title}</h3>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="bg-[#F8E9C7] text-[#E4AE2F] text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <PlaySquareIcon size={13} />
              {videoCount} video{videoCount !== 1 ? "s" : ""}
            </span>
            <span className="bg-[#E6F6F6] text-[#51A5A5] text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <BookOpen size={13} />
              {articleCount} article{articleCount !== 1 ? "s" : ""}
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
            </span>
            {module.isLocked && (
              <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Lock size={12} /> Locked
              </span>
            )}
            {isFullyComplete && !module.isLocked && (
              <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> Complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {!module.isLocked && totalLessons > 0 && (
            <div style={{ maxWidth: 260 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                <span>{completedLessons}/{totalLessons} completed</span>
                <span style={{ color: isFullyComplete ? "#16a34a" : "#1E4A39", fontWeight: 600 }}>{progressPct}%</span>
              </div>
              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${progressPct}%`, height: "100%", background: isFullyComplete ? "#16a34a" : "#1E4A39", borderRadius: 4, transition: "width 0.5s ease" }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 16, alignItems: "flex-end" }}>
          <button
            disabled={module.isLocked}
            className={`rounded-lg px-4 py-2 text-sm text-white transition-all duration-200 ${module.isLocked ? "bg-gray-400 cursor-not-allowed" : isFullyComplete ? "bg-green-700 hover:scale-105 cursor-pointer" : "bg-emerald-900 hover:scale-105 cursor-pointer"}`}
          >
            {module.isLocked ? "Locked" : isFullyComplete ? "Review" : "Start learning"}
          </button>

          {/* Expand lessons + resources */}
          {!module.isLocked && (
            <button
              onClick={() => setModuleExpanded(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12, color: "#1E4A39", background: "transparent",
                border: "1px solid #1E4A39", borderRadius: 6, padding: "4px 10px",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1E4A39"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#1E4A39"; }}
            >
              {moduleExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {moduleExpanded ? "Collapse" : "Details"}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded section: Module resources + lessons ── */}
      {moduleExpanded && !module.isLocked && (
        <div style={{ borderTop: "1px solid #f0faf7", background: "#fafdfb" }}>

          {/* Module-level resources — GET /api/resources/module/:moduleId */}
          {(moduleResources.length > 0 || moduleResourcesLoading) && (
            <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #edf5f2" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                Module Resources
              </p>
              <ResourceList resources={moduleResources} loading={moduleResourcesLoading} />
            </div>
          )}

          {/* Lessons list */}
          {module.lessons && module.lessons.length > 0 && (
            <div style={{ padding: "12px 20px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                Lessons — click to expand resources & study time
              </p>
              <div style={{ border: "1px solid #e5f0ea", borderRadius: 10, overflow: "hidden", background: "white" }}>
                {module.lessons.map(lesson => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    onMarkComplete={onMarkComplete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}