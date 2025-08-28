"use client";

import type { User } from "@/lib/data";
import { users } from "@/lib/data";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("insta-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("insta-user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string) => {
    // Mock login: for this demo, we'll just log in the first user.
    // A real app would verify credentials against a database.
    const userToLogin = users[0];
    if (userToLogin) {
      localStorage.setItem("insta-user", JSON.stringify(userToLogin));
      setUser(userToLogin);
      router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("insta-user");
    setUser(null);
    router.push("/login");
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
