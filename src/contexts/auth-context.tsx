
"use client";

import type { User } from "@/lib/data";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserAndToken: (user: User, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("insta-user");
        const storedToken = localStorage.getItem("insta-token");
        if (storedUser && storedToken) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("insta-user");
        localStorage.removeItem("insta-token");
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);
  
  const updateUserAndToken = (user: User, token?: string) => {
    // Ensure followers/following are arrays for client-side consistency
    const consistentUser = {
        ...user,
        followers: Array.isArray(user.followers) ? user.followers : [],
        following: Array.isArray(user.following) ? user.following : [],
    }

    setUser(consistentUser);
    localStorage.setItem("insta-user", JSON.stringify(consistentUser));
    
    if (token) {
        setToken(token);
        localStorage.setItem("insta-token", token);
    }
  }


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

      const { user: loggedInUser, token: newAuthToken } = await response.json();
      
      if (loggedInUser && newAuthToken) {
        updateUserAndToken(loggedInUser, newAuthToken);
        router.push("/");
      } else {
        throw new Error("Login response missing user or token.");
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
    localStorage.removeItem("insta-token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, isLoading, updateUserAndToken }}>
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
