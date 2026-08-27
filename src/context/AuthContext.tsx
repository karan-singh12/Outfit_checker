"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  username: string | null;
  role: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { username?: string; bio?: string; phone?: string; location?: string; avatar?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "http://127.0.0.1:3003/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load token and fetch profile on mount
  useEffect(() => {
    async function loadStoredAuth() {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("tf_token");
        if (storedToken) {
          setToken(storedToken);
          try {
            const profile = await fetchProfile(storedToken);
            setUser(profile);
          } catch (err: any) {
            console.error("Failed to load user profile:", err);
            localStorage.removeItem("tf_token");
            setToken(null);
          }
        }
      }
      setLoading(false);
    }
    loadStoredAuth();
  }, []);

  async function fetchProfile(authToken: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }
    const json = await res.json();
    return json.data;
  }

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/user/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Login failed");
      }
      const { token: receivedToken, user: loggedUser } = json.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("tf_token", receivedToken);
      }
      setToken(receivedToken);
      setUser(loggedUser);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/user/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username, role: "USER" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Signup failed");
      }
      const { token: receivedToken, user: registeredUser } = json.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("tf_token", receivedToken);
      }
      setToken(receivedToken);
      setUser(registeredUser);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tf_token");
    }
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (data: { username?: string; bio?: string; phone?: string; location?: string; avatar?: string }) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile");
      }
      setUser(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout, updateProfile, clearError }}>
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
