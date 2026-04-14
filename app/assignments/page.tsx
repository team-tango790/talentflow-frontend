"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/sidebar";

const BASE_URL = "https://talentflow-backend-production.up.railway.app";

type FilterTab = "All" | "Due soon" | "Submitted" | "Graded";
type AssignmentStatus = "Overdue" | "Due soon" | "Graded A" | "Submitted";
type PageView = "list" | "submit" | "resubmit" | "success" | "view-submission" | "view-feedback";

interface ApiAssignment {
  id: number;
  status: AssignmentStatus;
  track: string;
  title: string;
  description: string;
  mentor: string;
  points: number;
  module?: number;
  moduleId?: number;
  courseId?: number;
  dateLabel: string;
  dateNote: string;
  action: "submit" | "start" | "feedback" | "view";
  submittedFile?: { name: string; size: string; type: string; url?: string } | null;
  submissionId?: number | null;
  noteToMentor?: string | null;
  figmaUrl?: string | null;
  portfolioUrl?: string | null;
  feedback?: { comment: string; grade: number; gradedAt: string } | null;
}

interface SubmissionPayload {
  figmaUrl?: string;
  portfolioUrl?: string;
  noteToMentor?: string;
  files?: File[];
}


async function fetchAssignments(): Promise<ApiAssignment[]> {
  const res = await fetch(`${BASE_URL}/api/assignments`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load assignments (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? []);
}

async function fetchAssignmentById(id: number): Promise<ApiAssignment> {
  const res = await fetch(`${BASE_URL}/api/assignments/${id}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load assignment ${id} (${res.status})`);
  const data = await res.json();
  return data.data ?? data;
}

export async function fetchAssignmentsByModule(moduleId: number): Promise<ApiAssignment[]> {
  const res = await fetch(`${BASE_URL}/api/assignments/module/${moduleId}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load module ${moduleId} assignments (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function fetchAssignmentsByCourse(courseId: number): Promise<ApiAssignment[]> {
  const res = await fetch(`${BASE_URL}/api/assignments/course/${courseId}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load course ${courseId} assignments (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? []);
}

async function fetchSubmissionById(submissionId: number): Promise<ApiAssignment> {
  const res = await fetch(`${BASE_URL}/api/submissions/${submissionId}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load submission ${submissionId} (${res.status})`);
  const data = await res.json();
  return data.data ?? data;
}

/** POST /api/submissions/:assignmentId — first-time submission */
async function submitAssignment(
  assignmentId: number,
  payload: SubmissionPayload
): Promise<void> {
  const formData = buildFormData(payload);
  const res = await fetch(`${BASE_URL}/api/submissions/${assignmentId}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Submission failed (${res.status})`);
  }
}

/** POST /api/submissions/:assignmentId/resubmit — resubmit / edit an existing submission */
async function resubmitAssignment(
  assignmentId: number,
  payload: SubmissionPayload
): Promise<void> {
  const formData = buildFormData(payload);
  const res = await fetch(`${BASE_URL}/api/submissions/${assignmentId}/resubmit`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Resubmission failed (${res.status})`);
  }
}

/** Shared FormData builder */
function buildFormData(payload: SubmissionPayload): FormData {
  const fd = new FormData();
  if (payload.figmaUrl)     fd.append("figmaUrl", payload.figmaUrl);
  if (payload.portfolioUrl) fd.append("portfolioUrl", payload.portfolioUrl);
  if (payload.noteToMentor) fd.append("noteToMentor", payload.noteToMentor);
  payload.files?.forEach((f) => fd.append("files", f));
  return fd;
}

/* ════════════════════════════════════
   STATIC FALLBACK
════════════════════════════════════ */
const FALLBACK_ASSIGNMENTS: ApiAssignment[] = [
  {
    id: 1, status: "Overdue", track: "UI/UX Design",
    title: "Mobile App Redesign Case Study",
    description: "Conduct a full UX audit and redesign the onboarding flow for the TalentFlow mobile app, including wireframes, prototypes and usability findings.",
    mentor: "Kweku Mensah", points: 60, module: 1, moduleId: 1, courseId: 1,
    dateLabel: "⚠ Was due Mar 19", dateNote: "overdue", action: "submit",
  },
  {
    id: 2, status: "Due soon", track: "UI/UX Design",
    title: "Design Systems 101",
    description: "Build a component library with reusable UI elements following atomic design principles.",
    mentor: "Kweku Mensah", points: 60, module: 1, moduleId: 1, courseId: 1,
    dateLabel: "Due Mar 24, 2026", dateNote: "upcoming", action: "start",
  },
  {
    id: 3, status: "Graded A", track: "UI/UX Design",
    title: "UX Audit of an Existing Product",
    description: "Choose a known app (e.g., banking, e-commerce, or learning platform) and evaluate its UX.",
    mentor: "Kweku Mensah", points: 60, module: 1, moduleId: 1, courseId: 1,
    dateLabel: "Graded Mar 16 . Excellent work!", dateNote: "graded", action: "feedback",
    submissionId: 301,
    submittedFile: { name: "App_Audit_Redesign_AO.pdf", size: "2.4 MB", type: "PDF Document" },
    noteToMentor: "Hi Mr. Tobi, the discussion guide is at the end of the document. I modelled the task structure on the Nielsen Norman template from Week 3.",
    feedback: {
      comment: "Strong work overall, Adaeze. Your identification of Nielsen's heuristics was accurate and well-structured. The severity matrix showed mature analytical thinking.",
      grade: 88, gradedAt: "Apr 6 7:40pm",
    },
  },
  {
    id: 4, status: "Submitted", track: "UI/UX Design",
    title: "UX Audit of an Existing Product",
    description: "Choose a known app (e.g., banking, e-commerce, or learning platform) and evaluate its UX.",
    mentor: "Kweku Mensah", points: 60, module: 1, moduleId: 1, courseId: 1,
    dateLabel: "Submitted Mar 19 . Awaiting grade", dateNote: "submitted", action: "view",
    submissionId: 302,
    submittedFile: { name: "App_Audit_Redesign_AO.pdf", size: "2.4 MB", type: "PDF Document" },
    noteToMentor: "Hi Mr. Tobi, the discussion guide is at the end of the document.",
    feedback: null,
  },
];

/* ════════════════════════════════════
   STATUS STYLES
════════════════════════════════════ */
const STATUS_STYLES: Record<AssignmentStatus, { color: string; bg: string; border: string }> = {
  "Overdue":   { color: "#c0392b", bg: "#fdf2f1", border: "#f5a9a3" },
  "Due soon":  { color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
  "Graded A":  { color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
  "Submitted": { color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
};

const CARD_LEFT_BORDER: Record<AssignmentStatus, string> = {
  "Overdue":   "#c0392b",
  "Due soon":  "#d97706",
  "Graded A":  "#15803d",
  "Submitted": "#2563eb",
};

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function AssignmentsPage() {
  const [activeTab, setActiveTab]               = useState<FilterTab>("All");
  const [view, setView]                         = useState<PageView>("list");
  const [selectedAssignment, setSelectedAssignment] = useState<ApiAssignment | null>(null);
  const [assignments, setAssignments]           = useState<ApiAssignment[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  // Track whether the detail view is freshly loading from the API
  const [detailLoading, setDetailLoading]       = useState(false);

  /* Load all assignments */
  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssignments();
      setAssignments(data.length ? data : FALLBACK_ASSIGNMENTS);
    } catch {
      setAssignments(FALLBACK_ASSIGNMENTS);
      setError("Could not reach server — showing cached data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const filtered = assignments.filter((a) => {
    if (activeTab === "All")       return true;
    if (activeTab === "Due soon")  return a.status === "Due soon" || a.status === "Overdue";
    if (activeTab === "Submitted") return a.status === "Submitted";
    if (activeTab === "Graded")    return a.status === "Graded A";
    return true;
  });

  /* When user clicks an action, optionally re-fetch the fresh single assignment */
  const handleAction = async (a: ApiAssignment) => {
    // Try to get the freshest data for this assignment before opening detail views
    if (a.action === "view" || a.action === "feedback") {
      setDetailLoading(true);
      try {
        // If we have a submissionId, fetch via GET /api/submissions/:submissionId
        const fresh = a.submissionId
          ? await fetchSubmissionById(a.submissionId)
          : await fetchAssignmentById(a.id);
        setSelectedAssignment({ ...a, ...fresh });
      } catch {
        setSelectedAssignment(a); // fall back to list data
      } finally {
        setDetailLoading(false);
      }
    } else {
      setSelectedAssignment(a);
    }

    if (a.action === "submit" || a.action === "start") setView("submit");
    else if (a.action === "view")     setView("view-submission");
    else if (a.action === "feedback") setView("view-feedback");
  };

  /* ── Sub-views ── */
  if (detailLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{globalStyles}</style>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <span className="spinner-dark" />
            <p style={{ color: "#7a9a91", fontSize: 14, marginTop: 16 }}>Loading submission…</p>
          </div>
        </div>
      </div>
    );
  }

  if ((view === "view-submission" || view === "view-feedback") && selectedAssignment) {
    return (
      <SubmissionDetailPage
        assignment={selectedAssignment}
        onBack={() => setView("list")}
        hasFeedback={view === "view-feedback"}
        onResubmit={() => setView("resubmit")}
      />
    );
  }

  if (view === "success") {
    return (
      <SuccessModal
        onDashboard={() => { setView("list"); loadAssignments(); }}
        onViewSubmission={() => { setView("list"); setActiveTab("Submitted"); loadAssignments(); }}
      />
    );
  }

  if ((view === "submit" || view === "resubmit") && selectedAssignment) {
    return (
      <TaskSubmissionPage
        assignment={selectedAssignment}
        isResubmit={view === "resubmit"}
        onBack={() => setView(view === "resubmit" ? "view-submission" : "list")}
        onSubmit={() => setView("success")}
      />
    );
  }

  /* ── Assignment list ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{
          height: 60, background: "white", borderBottom: "1px solid #e8eeec",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#f5f5f0", borderRadius: 8, padding: "8px 14px",
            border: "1px solid #e0e8e4", width: 320,
          }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#a0b4ae" strokeWidth="1.8"/>
              <path d="M14 14l3 3" stroke="#a0b4ae" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              placeholder="Search courses, lessons, projects"
              style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#112920", width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8"/>
              </svg>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#E9BD55", border: "1.5px solid white" }} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 6 }}>
            My assignment
          </h1>
          <p style={{ color: "#7a9a91", fontSize: 14, marginBottom: 28 }}>
            Track, manage, and submit all your course assignments and evaluations
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8,
              padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#92400e",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>⚠ {error}</span>
              <button onClick={loadAssignments}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#d97706", fontWeight: 600, fontSize: 13 }}>
                Retry
              </button>
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {(["All", "Due soon", "Submitted", "Graded"] as FilterTab[]).map((tab) => (
              <button key={tab} className="filter-tab" onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px", borderRadius: 24, border: "none",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  background: activeTab === tab ? "#112920" : "transparent",
                  color: activeTab === tab ? "white" : "#7a9a91",
                  transition: "all 0.2s",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card" style={{
                  background: "white", borderRadius: 12, height: 140,
                  border: "1px solid #e8eeec", borderLeft: "4px solid #e8eeec",
                  overflow: "hidden",
                }} />
              ))}
            </div>
          )}

          {/* Assignment cards */}
          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#7a9a91", fontSize: 14 }}>
                  No assignments in this category yet.
                </div>
              )}
              {filtered.map((a) => {
                const s = STATUS_STYLES[a.status];
                return (
                  <div key={a.id} className="assignment-card"
                    style={{
                      background: "white", borderRadius: 12,
                      border: "1px solid #e8eeec",
                      borderLeft: `4px solid ${CARD_LEFT_BORDER[a.status]}`,
                      display: "flex", alignItems: "stretch", overflow: "hidden",
                    }}>
                    <div style={{ flex: 1, padding: "22px 24px" }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: "3px 10px",
                          borderRadius: 20, background: s.bg, color: s.color,
                          border: `1px solid ${s.border}`,
                        }}>{a.status}</span>
                        <span style={{ fontSize: 12, color: "#7a9a91", background: "#f5f5f0", padding: "3px 10px", borderRadius: 20 }}>
                          {a.track}
                        </span>
                        {a.moduleId && (
                          <span style={{ fontSize: 12, color: "#9ab0aa", background: "#f5f5f0", padding: "3px 10px", borderRadius: 20 }}>
                            Module {a.module ?? a.moduleId}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#112920", marginBottom: 8 }}>
                        {a.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "#7a9a91", lineHeight: 1.6, marginBottom: 14, maxWidth: 620 }}>
                        {a.description}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13 }}>
                        <span style={{ color: "#7a9a91" }}>
                          Mentor: <strong style={{ color: "#112920" }}>{a.mentor}</strong>
                        </span>
                        <span style={{ color: "#7a9a91" }}>
                          Points: <strong style={{ color: "#112920" }}>{a.points}</strong>
                        </span>
                        <span style={{
                          color: a.dateNote === "overdue" ? "#c0392b"
                            : a.dateNote === "upcoming" ? "#d97706"
                            : a.dateNote === "graded" ? "#15803d"
                            : "#2563eb",
                          fontWeight: 500,
                        }}>{a.dateLabel}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, padding: "22px 24px", borderLeft: "1px solid #f0f4f2" }}>
                      {(a.action === "submit" || a.action === "start") && (
                        <button className="btn-dark" onClick={() => handleAction(a)}
                          style={{ background: "#112920", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                          {a.action === "submit" ? "Submit now" : "Start submission"}
                        </button>
                      )}
                      {a.action === "feedback" && (
                        <button className="btn-outline" onClick={() => handleAction(a)}
                          style={{ background: "white", color: "#112920", border: "1.5px solid #dce6e2", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                          View feedback
                        </button>
                      )}
                      {a.action === "view" && (
                        <button className="btn-outline" onClick={() => handleAction(a)}
                          style={{ background: "white", color: "#112920", border: "1.5px solid #dce6e2", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                          View submission
                        </button>
                      )}
                      {(a.action === "submit" || a.action === "start") && (
                        <button className="btn-outline"
                          style={{ background: "white", color: "#112920", border: "1.5px solid #dce6e2", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                          View brief
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   TASK SUBMISSION PAGE
   Handles both first submit and resubmit.
   POST /api/submissions/:assignmentId
   POST /api/submissions/:assignmentId/resubmit
════════════════════════════════════ */
function TaskSubmissionPage({
  assignment,
  isResubmit,
  onBack,
  onSubmit,
}: {
  assignment: ApiAssignment;
  isResubmit: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [isDragging, setIsDragging]     = useState(false);
  const [files, setFiles]               = useState<File[]>([]);
  // Pre-fill with existing values when resubmitting
  const [figmaUrl, setFigmaUrl]         = useState(assignment.figmaUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(assignment.portfolioUrl ?? "");
  const [noteToMentor, setNoteToMentor] = useState(assignment.noteToMentor ?? "");
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    setFiles((p) => [...p, ...Array.from(e.dataTransfer.files)]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((p) => [...p, ...Array.from(e.target.files!)]);
  };
  const removeFile = (i: number) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      const payload: SubmissionPayload = {
        figmaUrl: figmaUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
        noteToMentor: noteToMentor || undefined,
        files,
      };
      // Choose correct endpoint based on whether this is a resubmission
      if (isResubmit) {
        await resubmitAssignment(assignment.id, payload);
      } else {
        await submitAssignment(assignment.id, payload);
      }
      onSubmit();
    } catch (e: any) {
      setSubmitError(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0ede4", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <main style={{ flex: 1, overflowY: "auto", padding: "40px 56px", maxWidth: 860 }}>

          {/* Back */}
          <button onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: "#112920", fontWeight: 500,
              marginBottom: 32, padding: 0,
            }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8e4da", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {isResubmit ? "Back to Submission" : "Back to Dashboard"}
          </button>

          {/* Resubmit notice banner */}
          {isResubmit && (
            <div style={{
              background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8,
              padding: "10px 16px", marginBottom: 24, fontSize: 13, color: "#1d4ed8",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              You are editing an existing submission. Your previous files and links will be replaced.
            </div>
          )}

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#112920", marginBottom: 6 }}>
            {isResubmit ? "Edit Submission" : "Task submission"}
          </h1>
          <p style={{ color: "#7a9a91", fontSize: 14, marginBottom: 4 }}>
            {isResubmit
              ? "Update your deliverables for this assignment."
              : "Upload your final deliverables for the UI/UX cohort assignment."}
          </p>
          <p style={{ color: "#b8cec8", fontSize: 12, marginBottom: 36 }}>
            {isResubmit ? "Editing" : "Submitting"} for: <strong style={{ color: "#112920" }}>{assignment.title}</strong>
          </p>

          {/* Error banner */}
          {submitError && (
            <div style={{
              background: "#fdf2f1", border: "1px solid #f5a9a3", borderRadius: 8,
              padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#c0392b",
            }}>
              ✕ {submitError}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            style={{
              border: `1.5px dashed ${isDragging ? "#112920" : "#b8d4c8"}`,
              borderRadius: 16,
              background: isDragging ? "rgba(17,41,32,0.04)" : "#e8f0ec",
              padding: "72px 24px", textAlign: "center", cursor: "pointer",
              transition: "all 0.2s", marginBottom: 32,
            }}>
            <input id="file-input" type="file" multiple style={{ display: "none" }} onChange={handleFileInput} accept=".fig,.sketch,.pdf,.png" />
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 2px 10px rgba(17,41,32,0.08)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 14.899A7 7 0 1115.71 8h1.79a4.5 4.5 0 012.5 8.242" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12v9M8 16l4-4 4 4" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontWeight: 600, color: "#112920", fontSize: 16, marginBottom: 8 }}>
              {isResubmit ? "Replace or add files" : "Drag & drop your files here"}
            </p>
            <p style={{ color: "#3d8a6a", fontSize: 13, marginBottom: 20 }}>or click to browse from your computer</p>
            <span style={{ background: "white", border: "1px solid #d0e4dc", borderRadius: 20, padding: "5px 16px", fontSize: 12, color: "#7a9a91" }}>
              Supports: .fig, .sketch, .pdf, .png (Max 25MB)
            </span>
          </div>

          {/* Existing submitted file (resubmit mode) */}
          {isResubmit && assignment.submittedFile && files.length === 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#9ab0aa", marginBottom: 8 }}>Current file (will be replaced if you upload a new one):</p>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#f0f5f2", border: "1px solid #d8ede4", borderRadius: 10, padding: "10px 16px",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#2196a8" strokeWidth="1.8"/>
                    <polyline points="14 2 14 8 20 8" stroke="#2196a8" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#112920" }}>{assignment.submittedFile.name}</p>
                  <p style={{ fontSize: 11, color: "#9ab0aa" }}>{assignment.submittedFile.size} · {assignment.submittedFile.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* New files list */}
          {files.length > 0 && (
            <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", border: "1px solid #e0e8e4", borderRadius: 10, padding: "10px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0f5f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#112920" strokeWidth="1.8"/>
                        <polyline points="14 2 14 8 20 8" stroke="#112920" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#112920" }}>{f.name}</p>
                      <p style={{ fontSize: 11, color: "#9ab0aa" }}>{(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontSize: 16 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* URL + Note fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 8 }}>
                Figma Prototype URL
              </label>
              <input className="tf-input-light" type="url" placeholder="https://www.figma.com/proto/..."
                value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)}
                style={{ width: "100%", height: 50, border: "1.5px solid #d8e4e0", borderRadius: 10, padding: "0 16px", fontSize: 14, color: "#112920", background: "white", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 8 }}>
                Portfolio/Case Study URL
              </label>
              <input className="tf-input-light" type="url" placeholder="https://yourportfolio.com/case-study"
                value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                style={{ width: "100%", height: 50, border: "1.5px solid #d8e4e0", borderRadius: 10, padding: "0 16px", fontSize: 14, color: "#112920", background: "white", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 8 }}>
                Note to Mentor <span style={{ fontWeight: 400, color: "#9ab0aa" }}>(optional)</span>
              </label>
              <textarea className="tf-input-light"
                placeholder="Any context you'd like your mentor to know before reviewing..."
                value={noteToMentor} onChange={(e) => setNoteToMentor(e.target.value)}
                rows={3}
                style={{ width: "100%", border: "1.5px solid #d8e4e0", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#112920", background: "white", outline: "none", resize: "vertical", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* Submit / Resubmit button */}
          <button onClick={handleSubmit} disabled={submitting} className="btn-submit"
            style={{
              width: "100%", height: 54, borderRadius: 12,
              background: submitting ? "#3d6b58" : "#112920",
              color: "white", border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
            {submitting ? (
              <><span className="spinner" />{isResubmit ? "Updating…" : "Submitting…"}</>
            ) : (
              isResubmit ? "Update Submission" : "Submit Assignment"
            )}
          </button>
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   SUBMISSION DETAIL PAGE
   GET /api/submissions/:submissionId
   (data pre-loaded before this mounts)
════════════════════════════════════ */
function SubmissionDetailPage({
  assignment,
  onBack,
  hasFeedback,
  onResubmit,
}: {
  assignment: ApiAssignment;
  onBack: () => void;
  hasFeedback: boolean;
  onResubmit: () => void;
}) {
  const feedback = hasFeedback ? assignment.feedback : null;
  // Only "Submitted" (not yet graded) can be resubmitted
  const canResubmit = assignment.status === "Submitted";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f2419", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>

          {/* Top-right controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            {/* Back link (left) */}
            <button onClick={onBack}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            {/* Right controls */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Resubmit button — only when not yet graded */}
              {canResubmit && (
                <button onClick={onResubmit}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, cursor: "pointer",
                    color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 500,
                    padding: "8px 14px",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Edit submission
                </button>
              )}
              {/* Share/link icon button */}
              <button style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main card */}
          <div style={{ background: "#f7f5ef", borderRadius: 16, overflow: "hidden", marginBottom: 16, borderLeft: "4px solid #c9a227" }}>
            <div style={{ padding: "28px 28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#112920" }}>
                  {assignment.title}
                </h2>
                {/* Status badge */}
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                  background: STATUS_STYLES[assignment.status].bg,
                  color: STATUS_STYLES[assignment.status].color,
                  border: `1px solid ${STATUS_STYLES[assignment.status].border}`,
                  whiteSpace: "nowrap",
                }}>{assignment.status}</span>
              </div>
              <p style={{ fontSize: 13, color: "#7a9a91", lineHeight: 1.6, marginBottom: 14 }}>
                {assignment.description}
              </p>
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#7a9a91" }}>
                <span>Points <strong style={{ color: "#112920" }}>{assignment.points}</strong></span>
                <span>Module <strong style={{ color: "#112920" }}>{assignment.module ?? assignment.moduleId}</strong></span>
                {assignment.submissionId && (
                  <span style={{ color: "#b0c4bc" }}>Submission #{assignment.submissionId}</span>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e4e0d6" }} />

            {/* Note + File row */}
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "20px 24px", borderRight: "1px solid #e4e0d6" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 10 }}>Note to mentor</p>
                <p style={{ fontSize: 13, color: "#5a7a72", lineHeight: 1.7 }}>
                  {assignment.noteToMentor ?? "—"}
                </p>
                {/* Show links if present */}
                {(assignment.figmaUrl || assignment.portfolioUrl) && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    {assignment.figmaUrl && (
                      <a href={assignment.figmaUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, color: "#2196a8", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Figma prototype
                      </a>
                    )}
                    {assignment.portfolioUrl && (
                      <a href={assignment.portfolioUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, color: "#2196a8", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Portfolio / Case study
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, padding: "20px 24px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 12 }}>Submitted file</p>
                {assignment.submittedFile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#2196a8" strokeWidth="1.8"/>
                          <polyline points="14 2 14 8 20 8" stroke="#2196a8" strokeWidth="1.8" strokeLinecap="round"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="#2196a8" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="#2196a8" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#112920" }}>{assignment.submittedFile.name}</p>
                        <p style={{ fontSize: 11, color: "#9ab0aa" }}>{assignment.submittedFile.size} · {assignment.submittedFile.type}</p>
                      </div>
                    </div>
                    {/* Download — uses file url if backend provides it */}
                    <a
                      href={assignment.submittedFile.url ?? "#"}
                      download={!assignment.submittedFile.url ? undefined : assignment.submittedFile.name}
                      style={{ display: "flex", alignItems: "center", gap: 6, color: "#2196a8", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Download
                    </a>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#9ab0aa" }}>No file attached</p>
                )}
              </div>
            </div>
          </div>

          {/* Feedback section */}
          <div style={{ background: "#f7f5ef", borderRadius: 16, padding: "24px 28px" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#112920", marginBottom: 20 }}>
              Submission Feedback
            </h3>
            {!feedback ? (
              <div style={{ border: "1.5px solid #e4e0d6", borderRadius: 12, padding: "60px 24px", textAlign: "center", background: "#f0ede4" }}>
                <p style={{ color: "#b0c4bc", fontSize: 15 }}>No feedback yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1.4, border: "1.5px solid #e4e0d6", borderRadius: 12, padding: "18px 20px", background: "#f0ede4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2196a8", display: "inline-block" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#112920" }}>Comments</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#9ab0aa" }}>Graded {feedback.gradedAt}</span>
                  </div>
                  <div style={{ borderLeft: "3px solid #2196a8", background: "#e8f4f8", borderRadius: "0 8px 8px 0", padding: "14px" }}>
                    <p style={{ fontSize: 13, color: "#2d4a42", lineHeight: 1.75 }}>{feedback.comment}</p>
                  </div>
                </div>
                <div style={{ flex: 0.7, border: "1.5px solid #e4e0d6", borderRadius: 12, padding: "18px 20px", background: "#f0ede4", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, alignSelf: "flex-start" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4a93d", display: "inline-block" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#112920" }}>Grade</span>
                  </div>
                  <CircularGrade grade={feedback.grade} />
                  <p style={{ fontSize: 12, color: "#9ab0aa", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
                    This is going to make up your total<br />Grade point average
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   CIRCULAR GRADE
════════════════════════════════════ */
function CircularGrade({ grade }: { grade: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = (grade / 100) * circumference;
  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e4e0d6" strokeWidth="7" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#d4a93d" strokeWidth="7"
          strokeDasharray={`${progress} ${circumference - progress}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#112920", lineHeight: 1 }}>{grade}</span>
        <span style={{ fontSize: 10, color: "#9ab0aa" }}>Out of 100</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   SUCCESS MODAL
════════════════════════════════════ */
function SuccessModal({ onDashboard, onViewSubmission }: { onDashboard: () => void; onViewSubmission: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,41,32,0.75)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <div style={{ background: "white", borderRadius: 24, padding: "44px 40px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", position: "relative", animation: "modalIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
        <span style={{ position: "absolute", top: 32, left: 56, color: "#E9BD55", fontSize: 20, opacity: 0.85 }}>✦</span>
        <span style={{ position: "absolute", top: 48, right: 72, color: "#E9BD55", fontSize: 14, opacity: 0.65 }}>✦</span>
        <span style={{ position: "absolute", top: 88, right: 48, color: "#E9BD55", fontSize: 22, opacity: 0.9 }}>✦</span>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#fef9ec", border: "2px solid #f0d070", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="19" stroke="#E9BD55" strokeWidth="2" />
            <path d="M12 21l7 7 11-13" stroke="#E9BD55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#112920", marginBottom: 14, lineHeight: 1.3 }}>
          Assignment<br />Submitted
        </h2>
        <p style={{ color: "#3d8a6a", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Your work is now under review. You'll receive<br />feedback within 48 hours.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={onDashboard} className="btn-dark"
            style={{ width: "100%", height: 52, borderRadius: 12, background: "#112920", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s, transform 0.15s" }}>
            Back to Dashboard
          </button>
          <button onClick={onViewSubmission} className="btn-outline"
            style={{ width: "100%", height: 52, borderRadius: 12, background: "white", color: "#112920", border: "1.5px solid #e0e8e4", cursor: "pointer", fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, background 0.2s" }}>
            View Submission
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   GLOBAL STYLES
════════════════════════════════════ */
const globalStyles = `
 @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .skeleton-card {
    background: linear-gradient(90deg, #f0f0ec 25%, #e8e8e2 50%, #f0f0ec 75%) !important;
    background-size: 1200px 100% !important;
    animation: shimmer 1.4s infinite linear;
  }
  .spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }
  .spinner-dark {
    display: inline-block; width: 28px; height: 28px;
    border: 2.5px solid #d8e8e2; border-top-color: #112920;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }

  .filter-tab:hover { background: #f0f4f2 !important; color: #112920 !important; }
  .assignment-card { transition: box-shadow 0.2s, transform 0.15s; }
  .assignment-card:hover { box-shadow: 0 4px 20px rgba(17,41,32,0.08); transform: translateY(-1px); }
  .btn-dark:hover { background: #1a3d2e !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(17,41,32,0.25) !important; }
  .btn-outline:hover { border-color: #112920 !important; background: #f3f7f5 !important; }
  .btn-submit:hover:not(:disabled) { background: #1a3d2e !important; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(17,41,32,0.28) !important; }
  .tf-input-light:focus { border-color: #112920 !important; box-shadow: 0 0 0 4px rgba(17,41,32,0.06) !important; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c8d8d2; border-radius: 10px; }
`;