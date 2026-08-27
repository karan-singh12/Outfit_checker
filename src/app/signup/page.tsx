"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { user, signup, loading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  // Clear errors on mount
  useEffect(() => {
    clearError();
    // Redirect if already logged in
    if (user) {
      router.push("/profile");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username || !email || !password) {
      setValidationError("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      setValidationError("Username must be at least 3 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await signup(email, password, username);
    } catch (err) {
      // Error is handled by context state
    }
  };

  return (
    <div className="setup-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
      <div className="setup-container" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="setup-card" style={{ padding: "40px 32px" }}>
          <h2 className="setup-card-title" style={{ fontSize: "28px", marginBottom: "8px", background: "var(--accent-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
            Create Account
          </h2>
          <p className="setup-card-desc" style={{ marginBottom: "28px" }}>
            Sign up to build your digital twin and virtual wardrobe.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {(validationError || error) && (
              <div style={{ padding: "12px 16px", background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: "var(--r-xs)", color: "var(--danger)", fontSize: "13px" }}>
                {validationError || error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
              <input
                type="text"
                placeholder="choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--r-xs)",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--purple)"}
                onBlur={(e) => e.target.style.borderColor = "var(--card-border)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--r-xs)",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--purple)"}
                onBlur={(e) => e.target.style.borderColor = "var(--card-border)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
              <input
                type="password"
                placeholder="minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--r-xs)",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--purple)"}
                onBlur={(e) => e.target.style.borderColor = "var(--card-border)"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gradient"
              style={{
                width: "100%",
                padding: "14px",
                fontWeight: "600",
                fontSize: "14px",
                marginTop: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-soft)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--purple)", fontWeight: "600", textDecoration: "none" }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
