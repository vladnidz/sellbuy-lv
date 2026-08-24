"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: "demo-user-id",
  email: "demo@sellbuy.lv",
  name: "Demo Lietotājs",
  verified: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sellbuy_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("sellbuy_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, name?: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split("@")[0],
      verified: false,
    };
    setUser(newUser);
    localStorage.setItem("sellbuy_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sellbuy_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useDemoAuth() {
  const { user, login, logout, isLoading } = useAuth();

  const ensureDemoUser = async () => {
    if (!user && !isLoading) {
      await login(DEMO_USER.email, DEMO_USER.name || undefined);
    }
    return user || DEMO_USER;
  };

  return { user: user || DEMO_USER, login, logout, isLoading, ensureDemoUser };
}