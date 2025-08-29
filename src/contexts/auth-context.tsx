
"use client";

import type { User } from "@/lib/data";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("insta-user");
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("insta-user");
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const userToLogin: User = await response.json();

      if (userToLogin) {
        localStorage.setItem("insta-user", JSON.stringify(userToLogin));
        setUser(userToLogin);
        if (!userToLogin.profileSetupComplete) {
            router.push("/profile/setup");
        } else {
            router.push("/");
        }
      } else {
        throw new Error("User not found after successful login response.");
      }
    } catch (error) {
      console.error(error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("insta-user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
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
