// AuthContext for authentication state and JWT management

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem("jwt_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) setToken(storedToken);
    if (storedUser && storedUser !== "undefined") setUser(JSON.parse(storedUser));
  }, []);

  const login = (jwt: string, userObj: any) => {
    setToken(jwt);
    setUser(userObj);
    localStorage.setItem("jwt_token", jwt);
    localStorage.setItem("user", JSON.stringify(userObj));
    // In production, use httpOnly cookies for JWT storage for better security
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
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