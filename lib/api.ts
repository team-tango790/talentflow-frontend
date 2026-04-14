const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
});

// ─── Dashboard ───────────────────────────────────────
export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/intern/dashboard`, {
    headers: getHeaders(),
  });
  return res.json();
}

// ─── Messages (Study logs use honge) ─────────────────
export async function getStudyLogs() {
  const res = await fetch(`${BASE_URL}/api/intern/study-logs/summary`, {
    headers: getHeaders(),
  });
  return res.json();
}

// ─── Meetings / Enrollments ───────────────────────────
export async function getEnrollments() {
  const res = await fetch(`${BASE_URL}/api/intern/enrollments`, {
    headers: getHeaders(),
  });
  return res.json();
}

// ─── Course Progress ──────────────────────────────────
export async function getCourseProgress() {
  const res = await fetch(`${BASE_URL}/api/intern/course-progress`, {
    headers: getHeaders(),
  });
  return res.json();
}

// ─── Study Overtime (Chart ke liye) ──────────────────
export async function getStudyOvertime() {
  const res = await fetch(`${BASE_URL}/api/intern/study-overtime`, {
    headers: getHeaders(),
  });
  return res.json();
}