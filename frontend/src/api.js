const API_URL = "https://equiptrack-q9k9.onrender.com";

export async function apiFetch(path, options = {}) {
  const res = await fetch(API_URL + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}
