// app/(dashboard)/assignments/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import SideBar from "@/components/sidebar";
import { BASE_URL, getHeaders, safeJson } from "@/lib/api";

type FilterTab = "All" | "Due soon" | "Submitted" | "Graded";
type AssignmentStatus = "Overdue" | "Due soon" | "Graded A" | "Submitted";
type PageView = "list" | "submit" | "resubmit" | "success" | "view-submission" | "view-feedback";

interface ApiAssignment {
  id: string;
  status: AssignmentStatus;
  track: string;
  title: string;
  description: string;
  mentor: string;
  points: number;
  moduleId?: string;
  courseId?: string;
  dateLabel: string;
  dateNote: string;
  action: "submit" | "start" | "feedback" | "view";
  submittedFile?: { name: string; size: string; type: string; url?: string } | null;
  submissionId?: string | null;
  noteToMentor?: string | null;
  figmaUrl?: string | null;
  portfolioUrl?: string | null;
  fileUrl?: string | null;
  feedback?: { comment: string; grade: number; gradedAt: string } | null;
}

interface SubmissionPayload {
  submissionType: string;
  fileUrl?: string;
  figmaUrl?: string;
  portfolioUrl?: string;
  noteToMentor?: string;
}

async function fetchEnrolledCourseAssignments(): Promise<ApiAssignment[]> {
  const enrollRes = await fetch(`${BASE_URL}/api/enrollments`, { headers: getHeaders() });
  if (!enrollRes.ok) throw new Error(`Enrollments failed (${enrollRes.status})`);
  const enrollData = await enrollRes.json();
  const enrollments: { courseId?: string; course?: { id: string } }[] = enrollData?.data ?? [];
  const all: Record<string, unknown>[] = [];
  for (const e of enrollments.slice(0, 5)) {
    const cid = e.courseId ?? e.course?.id;
    if (!cid) continue;
    try {
      const r = await fetch(`${BASE_URL}/api/assignments/course/${cid}`, { headers: getHeaders() });
      if (r.ok) { const d = await r.json(); all.push(...(d?.data ?? [])); }
    } catch { /* skip */ }
  }
  return all.map(mapAssignment);
}

async function fetchAssignmentById(id: string): Promise<ApiAssignment> {
  const res = await fetch(`${BASE_URL}/api/assignments/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Assignment fetch failed (${res.status})`);
  const data = await res.json();
  return mapAssignment(data.data ?? data);
}

async function fetchMySubmissions(): Promise<ApiAssignment[]> {
  const res = await fetch(`${BASE_URL}/api/submissions`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Submissions fetch failed (${res.status})`);
  const data = await res.json();
  return (data?.data ?? []).map(mapSubmission);
}

async function fetchSubmissionById(id: string): Promise<ApiAssignment> {
  const res = await fetch(`${BASE_URL}/api/submissions/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Submission fetch failed (${res.status})`);
  const data = await res.json();
  return mapSubmission(data.data ?? data);
}

async function submitAssignment(assignmentId: string, payload: SubmissionPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/submissions/${assignmentId}`, {
    method: "POST", headers: getHeaders(), body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson<{ message?: string }>(res);
    throw new Error(err?.message ?? `Submission failed (${res.status})`);
  }
}

async function resubmitAssignment(assignmentId: string, payload: SubmissionPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/submissions/${assignmentId}/resubmit`, {
    method: "PUT", headers: getHeaders(), body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson<{ message?: string }>(res);
    throw new Error(err?.message ?? `Resubmission failed (${res.status})`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAssignment(raw: any): ApiAssignment {
  const dueDate: string | undefined = raw.dueDate;
  const isOverdue = dueDate && new Date(dueDate) < new Date();
  return {
    id: String(raw.id),
    status: isOverdue ? "Overdue" : "Due soon",
    track: raw.track ?? "General",
    title: raw.title ?? "Assignment",
    description: raw.description ?? "",
    mentor: raw.mentor?.name ?? raw.mentorName ?? "Mentor",
    points: raw.points ?? 0,
    moduleId: raw.moduleId,
    courseId: raw.courseId,
    dateLabel: dueDate
      ? (isOverdue
        ? `⚠ Was due ${new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : `Due ${new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`)
      : "No due date",
    dateNote: isOverdue ? "overdue" : "upcoming",
    action: "start",
    submittedFile: null, submissionId: null, noteToMentor: null,
    figmaUrl: null, portfolioUrl: null, fileUrl: null, feedback: null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubmission(raw: any): ApiAssignment {
  const grade: number | null = raw.grade ?? null;
  const isGraded = grade != null;
  const assignment = raw.assignment ?? {};
  const createdAt: string | undefined = raw.createdAt;
  const gradedAt: string | undefined = raw.gradedAt;
  return {
    id: String(raw.assignmentId ?? assignment.id ?? raw.id),
    status: isGraded ? "Graded A" : "Submitted",
    track: assignment.track ?? "General",
    title: assignment.title ?? "Assignment",
    description: assignment.description ?? "",
    mentor: assignment.mentor?.name ?? "Mentor",
    points: assignment.points ?? 0,
    moduleId: assignment.moduleId,
    courseId: assignment.courseId,
    dateLabel: isGraded
      ? `Graded ${gradedAt ? new Date(gradedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""} · ${grade >= 80 ? "Excellent work!" : "See feedback"}`
      : `Submitted ${createdAt ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""} · Awaiting grade`,
    dateNote: isGraded ? "graded" : "submitted",
    action: isGraded ? "feedback" : "view",
    submissionId: String(raw.id),
    noteToMentor: raw.noteToMentor ?? null,
    figmaUrl: raw.figmaUrl ?? null,
    portfolioUrl: raw.portfolioUrl ?? null,
    fileUrl: raw.fileUrl ?? null,
    submittedFile: (raw.fileUrl || raw.figmaUrl || raw.portfolioUrl) ? {
      name: raw.fileUrl ? "Submitted file" : raw.figmaUrl ? "Figma link" : "Portfolio link",
      size: "—", type: raw.submissionType ?? "FILE",
      url: raw.fileUrl ?? raw.figmaUrl ?? raw.portfolioUrl,
    } : null,
    feedback: isGraded ? {
      comment: raw.feedback ?? "No written feedback provided.",
      grade,
      gradedAt: gradedAt ? new Date(gradedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—",
    } : null,
  };
}

const FALLBACK: ApiAssignment[] = [
  { id: "1", status: "Overdue", track: "UI/UX Design", title: "Mobile App Redesign Case Study", description: "Conduct a full UX audit and redesign the onboarding flow for the TalentFlow mobile app.", mentor: "Kweku Mensah", points: 60, dateLabel: "⚠ Was due Mar 19", dateNote: "overdue", action: "submit" },
  { id: "2", status: "Due soon", track: "UI/UX Design", title: "Design Systems 101", description: "Build a component library with reusable UI elements following atomic design principles.", mentor: "Kweku Mensah", points: 60, dateLabel: "Due Mar 24, 2026", dateNote: "upcoming", action: "start" },
  { id: "3", status: "Graded A", track: "UI/UX Design", title: "UX Audit of an Existing Product", description: "Choose a known app and evaluate its UX using Nielsen's heuristics.", mentor: "Kweku Mensah", points: 60, dateLabel: "Graded Mar 16 · Excellent work!", dateNote: "graded", action: "feedback", submissionId: "301", submittedFile: { name: "App_Audit_Redesign_AO.pdf", size: "2.4 MB", type: "PDF Document" }, noteToMentor: "Hi Mr. Tobi, the discussion guide is at the end of the document.", feedback: { comment: "Strong work overall. Your identification of Nielsen's heuristics was accurate and well-structured.", grade: 88, gradedAt: "Apr 6 7:40pm" } },
  { id: "4", status: "Submitted", track: "UI/UX Design", title: "UX Audit – Resubmission", description: "Choose a known app and evaluate its UX.", mentor: "Kweku Mensah", points: 60, dateLabel: "Submitted Mar 19 · Awaiting grade", dateNote: "submitted", action: "view", submissionId: "302", submittedFile: { name: "App_Audit_Redesign_AO.pdf", size: "2.4 MB", type: "PDF Document" }, noteToMentor: "Hi Mr. Tobi, the discussion guide is at the end of the document.", feedback: null },
];

const STATUS_STYLES: Record<AssignmentStatus, { color: string; bg: string; border: string }> = {
  "Overdue": { color: "#c0392b", bg: "#fdf2f1", border: "#f5a9a3" },
  "Due soon": { color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
  "Graded A": { color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
  "Submitted": { color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
};

const LEFT_BORDER: Record<AssignmentStatus, string> = {
  "Overdue": "#c0392b", "Due soon": "#d97706", "Graded A": "#15803d", "Submitted": "#2563eb",
};

function CircularGrade({ grade }: { grade: number }) {
  const r = 38, c = 2 * Math.PI * r, p = (grade / 100) * c;
  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e4e0d6" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#d4a93d" strokeWidth="7"
          strokeDasharray={`${p} ${c - p}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#112920", lineHeight: 1 }}>{grade}</span>
        <span style={{ fontSize: 10, color: "#9ab0aa" }}>Out of 100</span>
      </div>
    </div>
  );
}

function SuccessModal({ onDashboard, onViewSubmission }: { onDashboard: () => void; onViewSubmission: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,41,32,0.75)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: "'DM Sans', sans-serif", padding: "0 16px" }}>
      <div style={{ background: "white", borderRadius: 24, padding: "44px 32px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#fef9ec", border: "2px solid #f0d070", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="19" stroke="#E9BD55" strokeWidth="2" />
            <path d="M12 21l7 7 11-13" stroke="#E9BD55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#112920", marginBottom: 14 }}>Assignment<br />Submitted</h2>
        <p style={{ color: "#3d8a6a", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>Your work is now under review. You&apos;ll receive feedback within 48 hours.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={onDashboard} style={{ width: "100%", height: 52, borderRadius: 12, background: "#112920", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Back to Dashboard</button>
          <button onClick={onViewSubmission} style={{ width: "100%", height: 52, borderRadius: 12, background: "white", color: "#112920", border: "1.5px solid #e0e8e4", cursor: "pointer", fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>View Submission</button>
        </div>
      </div>
    </div>
  );
}

/* ── Submission Form ── */
function TaskSubmissionPage({ assignment, isResubmit, onBack, onSubmit }: {
  assignment: ApiAssignment; isResubmit: boolean; onBack: () => void; onSubmit: () => void;
}) {
  const [fileUrl, setFileUrl] = useState(assignment.fileUrl ?? "");
  const [figmaUrl, setFigmaUrl] = useState(assignment.figmaUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(assignment.portfolioUrl ?? "");
  const [noteToMentor, setNoteToMentor] = useState(assignment.noteToMentor ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      const payload: SubmissionPayload = {
        submissionType: "FILE",
        fileUrl: fileUrl || undefined,
        figmaUrl: figmaUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
        noteToMentor: noteToMentor || undefined,
      };
      if (isResubmit) await resubmitAssignment(assignment.id, payload);
      else await submitAssignment(assignment.id, payload);
      onSubmit();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 50, border: "1.5px solid #d8e4e0", borderRadius: 10,
    padding: "0 16px", fontSize: 14, color: "#112920", background: "white",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <>
      <style>{globalStyles}</style>
      {/* Full-height scrollable content — parent layout provides the frame */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f0ede4" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 48px" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#112920", fontWeight: 500, marginBottom: 32, padding: 0 }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8e4da", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            {isResubmit ? "Back to Submission" : "Back to Assignments"}
          </button>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#112920", marginBottom: 6 }}>
            {isResubmit ? "Edit Submission" : "Task Submission"}
          </h1>
          <p style={{ color: "#b8cec8", fontSize: 12, marginBottom: 36 }}>
            For: <strong style={{ color: "#112920" }}>{assignment.title}</strong>
          </p>

          {error && (
            <div style={{ background: "#fdf2f1", border: "1px solid #f5a9a3", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#c0392b" }}>
              ✕ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
            {[
              { label: "File URL", placeholder: "https://drive.google.com/...", value: fileUrl, onChange: setFileUrl },
              { label: "Figma Prototype URL", placeholder: "https://www.figma.com/proto/...", value: figmaUrl, onChange: setFigmaUrl },
              { label: "Portfolio / Case Study URL", placeholder: "https://yourportfolio.com/case-study", value: portfolioUrl, onChange: setPortfolioUrl },
            ].map(({ label, placeholder, value, onChange }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 8 }}>{label}</label>
                <input type="url" placeholder={placeholder} value={value}
                  onChange={(e) => onChange(e.target.value)} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 8 }}>
                Note to Mentor <span style={{ fontWeight: 400, color: "#9ab0aa" }}>(optional)</span>
              </label>
              <textarea placeholder="Any context for your mentor..." value={noteToMentor}
                onChange={(e) => setNoteToMentor(e.target.value)} rows={3}
                style={{ ...inputStyle, height: "auto", padding: "12px 16px", resize: "vertical", lineHeight: 1.6 }} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", height: 54, borderRadius: 12, background: submitting ? "#3d6b58" : "#112920", color: "white", border: "none", cursor: submitting ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {submitting
              ? (<><span className="spinner" />{isResubmit ? "Updating…" : "Submitting…"}</>)
              : (isResubmit ? "Update Submission" : "Submit Assignment")}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Submission Detail ── */
function SubmissionDetailPage({ assignment, onBack, hasFeedback, onResubmit }: {
  assignment: ApiAssignment; onBack: () => void; hasFeedback: boolean; onResubmit: () => void;
}) {
  const feedback = hasFeedback ? assignment.feedback : null;
  const canResubmit = assignment.status === "Submitted";
  const s = STATUS_STYLES[assignment.status];

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ flex: 1, overflowY: "auto", background: "#f0ede4" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 48px" }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#7a9a91", fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
            {canResubmit && (
              <button onClick={onResubmit} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #d8e4e0", borderRadius: 8, cursor: "pointer", color: "#112920", fontSize: 13, fontWeight: 500, padding: "8px 14px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Edit submission
              </button>
            )}
          </div>

          {/* Assignment card */}
          <div style={{ background: "#f7f5ef", borderRadius: 16, overflow: "hidden", marginBottom: 16, borderLeft: "4px solid #c9a227" }}>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#112920" }}>{assignment.title}</h2>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>{assignment.status}</span>
              </div>
              <p style={{ fontSize: 13, color: "#7a9a91", lineHeight: 1.6, marginBottom: 14 }}>{assignment.description}</p>
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#7a9a91", flexWrap: "wrap" }}>
                <span>Points <strong style={{ color: "#112920" }}>{assignment.points}</strong></span>
                <span>Mentor <strong style={{ color: "#112920" }}>{assignment.mentor}</strong></span>
              </div>
            </div>

            {/* Submission info — stacks on mobile */}
            <div style={{ borderTop: "1px solid #e4e0d6", display: "flex", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px", padding: "20px 24px", borderRight: "1px solid #e4e0d6" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 10 }}>Note to mentor</p>
                <p style={{ fontSize: 13, color: "#5a7a72", lineHeight: 1.7 }}>{assignment.noteToMentor ?? "—"}</p>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  {assignment.fileUrl && <a href={assignment.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2196a8", textDecoration: "none" }}>📎 Submitted file</a>}
                  {assignment.figmaUrl && <a href={assignment.figmaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2196a8", textDecoration: "none" }}>🎨 Figma prototype</a>}
                  {assignment.portfolioUrl && <a href={assignment.portfolioUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2196a8", textDecoration: "none" }}>🔗 Portfolio</a>}
                </div>
              </div>
              <div style={{ flex: "1 1 160px", padding: "20px 24px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 12 }}>Submission type</p>
                <p style={{ fontSize: 13, color: "#7a9a91" }}>{assignment.submittedFile?.type ?? "FILE"}</p>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div style={{ background: "#f7f5ef", borderRadius: 16, padding: "24px" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#112920", marginBottom: 20 }}>Submission Feedback</h3>
            {!feedback ? (
              <div style={{ border: "1.5px solid #e4e0d6", borderRadius: 12, padding: "60px 24px", textAlign: "center", background: "#f0ede4" }}>
                <p style={{ color: "#b0c4bc", fontSize: 15 }}>No feedback yet. Check back after your mentor reviews your submission.</p>
              </div>
            ) : (
              /* stacks vertically on mobile */
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 260px", border: "1.5px solid #e4e0d6", borderRadius: 12, padding: "18px 20px", background: "#f0ede4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#112920" }}>Comments</span>
                    <span style={{ fontSize: 12, color: "#9ab0aa" }}>Graded {feedback.gradedAt}</span>
                  </div>
                  <div style={{ borderLeft: "3px solid #2196a8", background: "#e8f4f8", borderRadius: "0 8px 8px 0", padding: 14 }}>
                    <p style={{ fontSize: 13, color: "#2d4a42", lineHeight: 1.75 }}>{feedback.comment}</p>
                  </div>
                </div>
                <div style={{ flex: "0 1 200px", border: "1.5px solid #e4e0d6", borderRadius: 12, padding: "18px 20px", background: "#f0ede4", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#112920", marginBottom: 20, alignSelf: "flex-start" }}>Grade</span>
                  <CircularGrade grade={feedback.grade} />
                  <p style={{ fontSize: 12, color: "#9ab0aa", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>Makes up your total<br />Grade Point Average</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [view, setView] = useState<PageView>("list");
  const [selected, setSelected] = useState<ApiAssignment | null>(null);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [courseAssignments, submissions] = await Promise.allSettled([
        fetchEnrolledCourseAssignments(),
        fetchMySubmissions(),
      ]);
      const assignList = courseAssignments.status === "fulfilled" ? courseAssignments.value : [];
      const subList = submissions.status === "fulfilled" ? submissions.value : [];
      const submittedIds = new Set(subList.map(s => s.id));
      const merged = [...subList, ...assignList.filter(a => !submittedIds.has(a.id))];
      if (merged.length > 0) { setAssignments(merged); }
      else { setAssignments(FALLBACK); setError("No assignments found — showing demo data."); }
    } catch {
      setAssignments(FALLBACK); setError("Could not reach server — showing demo data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = assignments.filter(a => {
    if (activeTab === "All") return true;
    if (activeTab === "Due soon") return a.status === "Due soon" || a.status === "Overdue";
    if (activeTab === "Submitted") return a.status === "Submitted";
    if (activeTab === "Graded") return a.status === "Graded A";
    return true;
  });

  const handleAction = async (a: ApiAssignment) => {
    if (a.action === "view" || a.action === "feedback") {
      setDetailLoading(true);
      try {
        const fresh = a.submissionId ? await fetchSubmissionById(a.submissionId) : await fetchAssignmentById(a.id);
        setSelected({ ...a, ...fresh });
      } catch { setSelected(a); }
      finally { setDetailLoading(false); }
    } else {
      setSelected(a);
    }
    if (a.action === "submit" || a.action === "start") setView("submit");
    else if (a.action === "view") setView("view-submission");
    else if (a.action === "feedback") setView("view-feedback");
  };

  /* ── Loading detail ── */
  if (detailLoading) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f0" }}>
        <div style={{ textAlign: "center" }}>
          <span className="spinner-dark" style={{ display: "inline-block" }} />
          <p style={{ color: "#7a9a91", fontSize: 14, marginTop: 16 }}>Loading submission…</p>
        </div>
      </div>
    </>
  );

  /* ── Sub-views ── */
  if ((view === "view-submission" || view === "view-feedback") && selected)
    return <SubmissionDetailPage assignment={selected} onBack={() => setView("list")} hasFeedback={view === "view-feedback"} onResubmit={() => setView("resubmit")} />;

  if (view === "success")
    return <SuccessModal onDashboard={() => { setView("list"); load(); }} onViewSubmission={() => { setView("list"); setActiveTab("Submitted"); load(); }} />;

  if ((view === "submit" || view === "resubmit") && selected)
    return <TaskSubmissionPage assignment={selected} isResubmit={view === "resubmit"} onBack={() => setView(view === "resubmit" ? "view-submission" : "list")} onSubmit={() => setView("success")} />;

  /* ── List view ── */
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <SideBar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f5f5f0", minWidth: 0 }}>

          {/* Top bar — hides on mobile (sidebar header takes over) */}
          <header className="desk-header" style={{ height: 60, background: "white", borderBottom: "1px solid #e8eeec", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f0", borderRadius: 8, padding: "8px 14px", border: "1px solid #e0e8e4", width: "min(320px, 100%)" }}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="7" stroke="#a0b4ae" strokeWidth="1.8" /><path d="M14 14l3 3" stroke="#a0b4ae" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input placeholder="Search assignments…" style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#112920", width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8" /></svg>
              </button>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, position: "relative" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#E9BD55", border: "1.5px solid white" }} />
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "28px 24px 40px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, color: "#112920", marginBottom: 6 }}>My Assignments</h1>
              <p style={{ color: "#7a9a91", fontSize: 14, marginBottom: 24 }}>Track, manage, and submit all your course assignments and evaluations</p>

              {error && (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span>⚠ {error}</span>
                  <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Retry</button>
                </div>
              )}

              {/* Filter tabs — horizontally scrollable on mobile */}
              <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
                {(["All", "Due soon", "Submitted", "Graded"] as FilterTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 18px", borderRadius: 24, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", background: activeTab === tab ? "#112920" : "transparent", color: activeTab === tab ? "white" : "#7a9a91", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Skeletons */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton-card" style={{ borderRadius: 12, height: 140, border: "1px solid #e8eeec", borderLeft: "4px solid #e8eeec" }} />)}
                </div>
              )}

              {/* Cards */}
              {!loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#7a9a91", fontSize: 14 }}>No assignments in this category yet.</div>
                  )}
                  {filtered.map(a => {
                    const s = STATUS_STYLES[a.status];
                    return (
                      <div key={a.id} className="assignment-card" style={{ background: "white", borderRadius: 12, border: "1px solid #e8eeec", borderLeft: `4px solid ${LEFT_BORDER[a.status]}`, overflow: "hidden" }}>
                        {/* Card body + action — stacks on mobile */}
                        <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap" }}>
                          <div style={{ flex: "1 1 280px", padding: "20px 20px 16px" }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{a.status}</span>
                              <span style={{ fontSize: 12, color: "#7a9a91", background: "#f5f5f0", padding: "3px 10px", borderRadius: 20 }}>{a.track}</span>
                            </div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#112920", marginBottom: 8 }}>{a.title}</h3>
                            <p style={{ fontSize: 13, color: "#7a9a91", lineHeight: 1.6, marginBottom: 14 }}>{a.description}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, flexWrap: "wrap" }}>
                              <span style={{ color: "#7a9a91" }}>Mentor: <strong style={{ color: "#112920" }}>{a.mentor}</strong></span>
                              <span style={{ color: "#7a9a91" }}>Points: <strong style={{ color: "#112920" }}>{a.points}</strong></span>
                              <span style={{ color: a.dateNote === "overdue" ? "#c0392b" : a.dateNote === "upcoming" ? "#d97706" : a.dateNote === "graded" ? "#15803d" : "#2563eb", fontWeight: 500 }}>{a.dateLabel}</span>
                            </div>
                          </div>

                          {/* Action button — full-width on mobile */}
                          <div className="card-action" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 20px", borderTop: "1px solid #f0f4f2" }}>
                            {(a.action === "submit" || a.action === "start") && (
                              <button className="btn-dark" onClick={() => handleAction(a)} style={{ background: "#112920", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", width: "100%" }}>
                                {a.action === "submit" ? "Submit now" : "Start submission"}
                              </button>
                            )}
                            {a.action === "feedback" && (
                              <button className="btn-outline" onClick={() => handleAction(a)} style={{ background: "white", color: "#112920", border: "1.5px solid #dce6e2", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", width: "100%" }}>
                                View feedback
                              </button>
                            )}
                            {a.action === "view" && (
                              <button className="btn-outline" onClick={() => handleAction(a)} style={{ background: "white", color: "#112920", border: "1.5px solid #dce6e2", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", width: "100%" }}>
                                View submission
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes modalIn { from{opacity:0;transform:scale(0.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .skeleton-card { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e2 50%,#f0f0ec 75%) !important; background-size:1200px 100% !important; animation:shimmer 1.4s infinite linear; }
  .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
  .spinner-dark { display:inline-block; width:28px; height:28px; border:2.5px solid #d8e8e2; border-top-color:#112920; border-radius:50%; animation:spin 0.8s linear infinite; }
  .assignment-card { transition:box-shadow 0.2s,transform 0.15s; }
  .assignment-card:hover { box-shadow:0 4px 20px rgba(17,41,32,0.08); transform:translateY(-1px); }
  .btn-dark:hover { background:#1a3d2e !important; }
  .btn-outline:hover { border-color:#112920 !important; background:#f3f7f5 !important; }
  ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#c8d8d2;border-radius:10px}

  /* On desktop: action sits to the right, not full-width */
  @media (min-width: 640px) {
    .card-action {
      border-top: none !important;
      border-left: 1px solid #f0f4f2 !important;
      min-width: 160px;
      flex: 0 0 auto !important;
    }
    .card-action button { width: auto !important; }
  }

  /* Hide top search bar on mobile — sidebar header handles it */
  @media (max-width: 767px) {
    .desk-header { display: none !important; }
  }
`;