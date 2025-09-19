// AuthContext for authentication state and JWT management

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: string;
  email: string;
  // Add other user fields as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Restore user/token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch user info with token
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        credentials: "include",
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
          }
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        });
    } else {
      // Try cookie-based session
      fetch("/api/auth/me", {
        credentials: "include",
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
