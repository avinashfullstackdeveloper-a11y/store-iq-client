// Centralized API utility to prefix relative backend paths with VITE_API_BASE_URL
// Usage: authFetch("/api/route", { method: "GET" })
export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  let url: RequestInfo;

  if (typeof input === "string") {
    // If input is a full URL (http, https, or protocol-relative), leave unchanged
    if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(input)) {
      url = input;
    } else {
      // Otherwise, treat as relative backend path
      url = `${API_BASE_URL}${input}`;
    }
  } else {
    url = input;
  }

  return fetch(url, { ...init, credentials: "include" });
}