// lib/api.ts
// ─────────────────────────────────────────────────────────────────
// Central API layer for TalentFlow frontend.
// All endpoints match the actual backend routes.
// ─────────────────────────────────────────────────────────────────

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://talentflow-backend-7pp4.onrender.com";

// ── Auth header helper ────────────────────────────────────────────
export const getHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : ""
    }`,
});

// ── Safe JSON parser ──────────────────────────────────────────────
export async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Auth ──────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res;
}

// ── Dashboard ─────────────────────────────────────────────────────
export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Dashboard fetch failed (${res.status})`);
  return res.json();
}

// ── Enrollments ───────────────────────────────────────────────────
export async function getMyEnrollments() {
  const res = await fetch(`${BASE_URL}/api/enrollments`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Enrollments fetch failed (${res.status})`);
  return res.json();
}

export async function enrollInCourse(courseId: string) {
  const res = await fetch(`${BASE_URL}/api/enrollments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ courseId }),
  });
  if (!res.ok) throw new Error(`Enroll failed (${res.status})`);
  return res.json();
}

// ── Courses ───────────────────────────────────────────────────────
export async function getAllCourses() {
  const res = await fetch(`${BASE_URL}/api/courses`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Courses fetch failed (${res.status})`);
  return res.json();
}

export async function getCourseOverview(courseId: string) {
  const res = await fetch(`${BASE_URL}/api/courses/${courseId}/overview`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Course overview fetch failed (${res.status})`);
  return res.json();
}

export async function getCourseProgress(courseId: string) {
  const res = await fetch(`${BASE_URL}/api/courses/${courseId}/progress`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Course progress fetch failed (${res.status})`);
  return res.json();
}

// ── Modules ───────────────────────────────────────────────────────
export async function getCourseModules(courseId: string) {
  const res = await fetch(`${BASE_URL}/api/courses/${courseId}/modules`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Modules fetch failed (${res.status})`);
  return res.json();
}

export async function getModuleProgress(moduleId: string) {
  const res = await fetch(`${BASE_URL}/api/modules/${moduleId}/progress`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Module progress fetch failed (${res.status})`);
  return res.json();
}

// ── Lessons ───────────────────────────────────────────────────────
export async function getModuleLessons(moduleId: string) {
  const res = await fetch(`${BASE_URL}/api/modules/${moduleId}/lessons`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Lessons fetch failed (${res.status})`);
  return res.json();
}

export async function markLessonComplete(lessonId: string) {
  const res = await fetch(`${BASE_URL}/api/lessons/${lessonId}/complete`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Mark complete failed (${res.status})`);
  return res.json();
}

export async function logStudyTime(lessonId: string, duration: number) {
  const res = await fetch(`${BASE_URL}/api/lessons/${lessonId}/study-log`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ duration }),
  });
  if (!res.ok) throw new Error(`Study log failed (${res.status})`);
  return res.json();
}

// ── Assignments ───────────────────────────────────────────────────
export async function getAssignmentsByCourse(courseId: string) {
  const res = await fetch(`${BASE_URL}/api/assignments/course/${courseId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Assignments fetch failed (${res.status})`);
  return res.json();
}

export async function getAssignmentById(id: string) {
  const res = await fetch(`${BASE_URL}/api/assignments/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Assignment fetch failed (${res.status})`);
  return res.json();
}

// ── Submissions ───────────────────────────────────────────────────
export async function getMySubmissions() {
  const res = await fetch(`${BASE_URL}/api/submissions`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Submissions fetch failed (${res.status})`);
  return res.json();
}

export async function getSubmissionById(submissionId: string) {
  const res = await fetch(`${BASE_URL}/api/submissions/${submissionId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Submission fetch failed (${res.status})`);
  return res.json();
}

export async function submitAssignment(assignmentId: string, payload: {
  submissionType: string;
  fileUrl?: string;
  figmaUrl?: string;
  portfolioUrl?: string;
  noteToMentor?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/submissions/${assignmentId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson<{ message?: string }>(res);
    throw new Error(err?.message ?? `Submission failed (${res.status})`);
  }
  return res.json();
}

export async function resubmitAssignment(assignmentId: string, payload: {
  submissionType: string;
  fileUrl?: string;
  figmaUrl?: string;
  portfolioUrl?: string;
  noteToMentor?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/submissions/${assignmentId}/resubmit`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson<{ message?: string }>(res);
    throw new Error(err?.message ?? `Resubmission failed (${res.status})`);
  }
  return res.json();
}

// ── Resources ─────────────────────────────────────────────────────
export async function getCourseResources(courseId: string) {
  const res = await fetch(`${BASE_URL}/api/resources/course/${courseId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Resources fetch failed (${res.status})`);
  return res.json();
}

// ── Study Logs ────────────────────────────────────────────────────
export async function getMyStudySummary() {
  const res = await fetch(`${BASE_URL}/api/study-logs/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Study summary fetch failed (${res.status})`);
  return res.json();
}

export async function getStudyOvertime(period: "daily" | "weekly" | "monthly" = "weekly") {
  const res = await fetch(`${BASE_URL}/api/study-logs/me/overtime?period=${period}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Study overtime fetch failed (${res.status})`);
  return res.json();
}

// ── Analytics ─────────────────────────────────────────────────────
export async function getMyAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Analytics fetch failed (${res.status})`);
  return res.json();
}

export async function getMyModulePerformance(courseId?: string) {
  const url = courseId
    ? `${BASE_URL}/api/analytics/me/modules?courseId=${courseId}`
    : `${BASE_URL}/api/analytics/me/modules`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Module performance fetch failed (${res.status})`);
  return res.json();
}

export async function getMyStudyOvertimeAnalytics(period: "daily" | "weekly" | "monthly" = "weekly") {
  const res = await fetch(
    `${BASE_URL}/api/analytics/me/study-overtime?period=${period}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`Study overtime analytics fetch failed (${res.status})`);
  return res.json();
}

// ── Certificates ──────────────────────────────────────────────────
export async function getMyCertificates() {
  const res = await fetch(`${BASE_URL}/api/certificates/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Certificates fetch failed (${res.status})`);
  return res.json();
}

export async function getCertificateById(id: string) {
  const res = await fetch(`${BASE_URL}/api/certificates/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Certificate fetch failed (${res.status})`);
  return res.json();
}

// ── User profile ──────────────────────────────────────────────────
export async function getMyProfile() {
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Profile fetch failed (${res.status})`);
  return res.json();
}