
"use client";

import type { User } from "@/lib/data";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUser } from "@/lib/data"; // Using the new API-like function

interface AuthContextType {
  user: User | null;
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
      try {
        const storedUser = localStorage.getItem("insta-user");
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          // In a real app, you might want to re-validate the user session with the backend here.
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
      // In a real app, this would be an API call to your backend:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || "Login failed");
      // }
      // const userToLogin = data.user;
      
      // For now, we simulate a successful API call by fetching a user from the (now empty) data functions.
      // This will need to be replaced with a proper backend implementation.
      const usersResponse = await fetch('/api/users');
      const allUsers: User[] = await usersResponse.json();
      const userToLogin = allUsers.find(u => u.email === email);

      if (userToLogin) {
        localStorage.setItem("insta-user", JSON.stringify(userToLogin));
        setUser(userToLogin);
        router.push("/");
      } else {
        // Handle case where user is not found
        console.error("Login failed: User not found");
        // You might want to show a toast message here
      }
    } catch (error) {
      console.error(error);
      // Handle login error (e.g., show toast)
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
