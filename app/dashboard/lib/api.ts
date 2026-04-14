const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
});

export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: getHeaders(),
  });
  return res.json();
}