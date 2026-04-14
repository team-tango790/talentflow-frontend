const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// LOGIN — token milega
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // Token save karo
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}