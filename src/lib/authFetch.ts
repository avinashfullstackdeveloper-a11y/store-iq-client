// Track auth state
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_RESET_INTERVAL = 60 * 1000; // 1 minute

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  lastRefresh: number;
}

// Initialize auth state
const getInitialAuthState = (): AuthState => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  lastRefresh: Number(localStorage.getItem('lastRefresh')) || 0
});

let authState = getInitialAuthState();

/**
 * Updates the auth state and persists changes to localStorage
 */
function updateAuthState(updates: Partial<AuthState>) {
  authState = { ...authState, ...updates };
  
  if (updates.token !== undefined) {
    if (updates.token) {
      localStorage.setItem('token', updates.token);
    } else {
      localStorage.removeItem('token');
    }
  }
  
  if (updates.lastRefresh) {
    localStorage.setItem('lastRefresh', updates.lastRefresh.toString());
  }
}

/**
 * Handles token refresh
 */
async function refreshToken(): Promise<boolean> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      const { token } = await response.json();
      updateAuthState({
        token,
        isAuthenticated: true,
        lastRefresh: Date.now()
      });
      return true;
    }
  } catch (error) {
    console.error('[authFetch] Token refresh failed:', error);
  }
  
  return false;
}

/**
 * Enhanced fetch utility with authentication and automatic token refresh
 * Usage: authFetch("/api/route", { method: "GET" })
 */
export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  let url: RequestInfo;

  // Debug log in development
  if (import.meta.env.DEV) {
    console.debug('[authFetch] Starting request:', {
      input,
      init,
      API_BASE_URL,
      hasToken: !!localStorage.getItem("token")
    });
  }

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

  // Initialize headers with existing ones if present
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(init?.headers || {})
  };

  // Attach JWT from localStorage if present
  const token = localStorage.getItem("token");
  if (token) {
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }

  // Include credentials and handle CORS
  const fetchOptions = {
    ...init,
    headers,
    credentials: 'include' as RequestCredentials, // Required for cookies
    mode: 'cors' as RequestMode
  };

  // Debug auth headers in development
  if (import.meta.env.DEV) {
    // Safely check Authorization header
    const headerEntries = headers instanceof Headers ?
      Array.from(headers.entries()) :
      (Array.isArray(headers) ? headers : Object.entries(headers));
    
    const hasAuthHeader = headerEntries.some(([key]) =>
      key.toLowerCase() === 'authorization'
    );

    console.debug('[authFetch] Auth headers:', {
      hasToken: !!token,
      hasAuthHeader,
      hasCookies: true // Browser handles cookies automatically
    });
  }

  try {
    let response = await fetch(url, fetchOptions);
    
    // Handle auth errors with refresh attempt
    if (response.status === 401 && !isRefreshing && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      isRefreshing = true;
      refreshAttempts++;
      
      const refreshSuccessful = await refreshToken();
      
      if (refreshSuccessful) {
        // Retry original request with new token
        const retryFetchOptions = {
          ...fetchOptions,
          headers: {
            ...headers,
            Authorization: `Bearer ${authState.token}`
          }
        };
        response = await fetch(url, retryFetchOptions);
      }
      
      isRefreshing = false;
    }

    // Handle final response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `Request failed with status ${response.status}` };
      }

      if (response.status === 401) {
        // Clear auth state and redirect to login
        updateAuthState({
          token: null,
          isAuthenticated: false,
          lastRefresh: 0
        });
        
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?returnTo=${returnUrl}`;
        throw new Error('Session expired. Please log in again.');
      }

      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    
    console.error('[authFetch] Request failed:', {
      url: url.toString(),
      error,
      status: error.response?.status,
      refreshAttempts
    });
    throw error;
  }
}

// Reset refresh attempts periodically
setInterval(() => {
  refreshAttempts = 0;
}, REFRESH_RESET_INTERVAL);

// Export auth state management
export const getAuthState = () => ({ ...authState });