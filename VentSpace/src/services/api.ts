const API_URL = "http://localhost:4000";

type ApiOptions = RequestInit & {
  auth?: boolean; // attach token automatically
};

export async function apiFetch(
  endpoint: string,
  options: ApiOptions = {}
) {
  const { auth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  ...(headers as Record<string, string>),
};

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: finalHeaders,
    ...rest,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong");
  }

  return data;
}