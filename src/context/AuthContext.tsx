// AuthContext for authentication state and JWT management

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username?: string; // Add other user fields as needed
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateTimezone: (timezone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();

  // Restore user/token on mount or route change
  useEffect(() => {
    // Only run auth check on non-public routes
    // Treat any /login* or /signup* route as public
    const pathname = location.pathname;

        // Normalize path: remove trailing slash and lowercase, default to "/"
        let normalizedPath = pathname ? pathname.replace(/\/+$/, "").toLowerCase() : "/";
        if (normalizedPath === "") normalizedPath = "/";

    const publicRoutes = ["/", "/login", "/signup", "/about", "/tools"];
    const isPublic =
      publicRoutes.includes(normalizedPath) ||
      normalizedPath.startsWith("/login/") ||
      normalizedPath.startsWith("/signup/");

    if (isPublic) {
      setUser(null);
      setToken(null);
      setAuthError(null);
      return;
    }

    const storedToken = localStorage.getItem("token");
    const handleAuthMeResponse = async (res: Response) => {
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
          setAuthError(null);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          setAuthError("Authentication failed.");
        }
      } else if (res.status === 404) {
        // User not found: clear tokens, logout, redirect to login
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setAuthError("User not found. Please log in again.");
        // Optional: call logout() if you want to centralize logic
        // logout();
        window.location.assign("/login");
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setAuthError("Session expired. Please log in again.");
      } else if (res.status >= 500) {
        setAuthError(
          "The server is temporarily unavailable. Please try again later."
        );
        // Do not clear user/token
      } else {
        setAuthError("An unknown error occurred.");
      }
    };

    if (storedToken) {
      setToken(storedToken);
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        credentials: "include",
      })
        .then(handleAuthMeResponse)
        .catch(() => {
          setAuthError(
            "Unable to connect to the server. Please check your connection."
          );
          // Do not clear user/token
        });
    } else {
      // Try cookie-based session
      fetch("/api/auth/me", {
        credentials: "include",
      })
        .then(handleAuthMeResponse)
        .catch(() => {
          setAuthError(
            "Unable to connect to the server. Please check your connection."
          );
        });
    }
  }, [location.pathname]);

  const login = (_jwt: string, userObj: User) => {
    setToken(_jwt); // Store token in state
    setUser(userObj);
    if (_jwt) {
      localStorage.setItem("token", _jwt); // Persist token
    }
    // Optionally, persist user info if needed
    // localStorage.setItem("user", JSON.stringify(userObj));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
  };

  // PATCH user's timezone and update state
  const updateTimezone = async (timezone: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ timezone }),
      });
      if (!res.ok) throw new Error("Failed to update timezone");
      // Re-fetch user from backend to ensure state matches persisted value
      const userRes = await fetch("/api/auth/me", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (userRes.ok) {
        const data = await userRes.json();
        if (data && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      // Optionally handle error (toast, etc)
      // console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateTimezone }}>
      {authError && (
        <div style={{ color: "red", textAlign: "center", margin: "1em" }}>
          {authError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
