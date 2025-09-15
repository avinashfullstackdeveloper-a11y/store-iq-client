// Utility to send JWT in Authorization header for protected API calls

// Usage: authFetch("/api/protected", { method: "GET" })
export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem("jwt_token");
  const headers = {
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(input, { ...init, headers });
}