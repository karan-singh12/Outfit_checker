"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { uploadAvatar } from "../../services/api";
import { SOUTH_ASIAN_SKIN_PROFILES } from "../../components/SkinToneSelector";
import WhatsAppModal from "../../components/WhatsAppModal";

export default function ProfilePage() {
  const { user, updateProfile, loading, error, clearError, token, logout } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedTwin, setSavedTwin] = useState<any>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Sync user details when they load
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
    if (typeof window !== "undefined") {
      const twinData = localStorage.getItem("tf_body_twin");
      if (twinData) {
        try {
          setSavedTwin(JSON.parse(twinData));
        } catch {}
      }
    }
  }, [user]);

  // Protect route
  useEffect(() => {
    // If auth finishes loading and user is still null, redirect to login
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
    if (!storedToken) {
      router.push("/login");
    }
  }, [user, router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setValidationError(null);
    setSuccessMessage(null);
    clearError();

    try {
      const url = await uploadAvatar(token || "", file);
      setAvatar(url);
      setSuccessMessage("Avatar uploaded! Save changes to persist.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setValidationError(err.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setValidationError(null);
    clearError();

    if (!username.trim()) {
      setValidationError("Username is required.");
      return;
    }

    try {
      await updateProfile({
        username,
        bio,
        location,
        phone,
        avatar,
      });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      // Error handles by context
    }
  };

  if (!user) {
    return (
      <div className="setup-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <p style={{ color: "var(--text-soft)", fontSize: "16px" }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="setup-page" style={{ padding: "40px 24px" }}>
      <div className="setup-container" style={{ maxWidth: "800px", width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
        
        {/* Profile Card & Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "28px" }}>
          
          {/* Card 1: User Summary Card */}
          <div className="setup-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 24px" }}>
            {user.avatar ? (
              <img
                src={user.avatar.startsWith("/public") ? `http://127.0.0.1:3003${user.avatar}` : user.avatar}
                alt="Profile Avatar"
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "16px",
                  boxShadow: "var(--glow-purple)",
                  border: "2px solid var(--purple)",
                }}
              />
            ) : (
              <div style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                background: "var(--accent-grad)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "700",
                color: "#08080a",
                marginBottom: "16px",
                boxShadow: "var(--glow-purple)"
              }}>
                {user.username ? user.username.substring(0, 1).toUpperCase() : user.email.substring(0, 1).toUpperCase()}
              </div>
            )}
            
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
              {user.username || "Anonymous"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-soft)", marginBottom: "20px" }}>
              {user.email}
            </p>

            <span className="mockup-tag" style={{ background: "rgba(0, 201, 141, 0.08)", color: "var(--purple)", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em", padding: "4px 10px", borderRadius: "100px", marginBottom: "24px" }}>
              {user.role}
            </span>

            <div style={{ width: "100%", borderTop: "1px solid var(--card-border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--muted)" }}>Location</span>
                <span style={{ color: "var(--text-soft)" }}>{user.location || "Not set"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--muted)" }}>Phone</span>
                <span style={{ color: "var(--text-soft)" }}>{user.phone || "Not set"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                <span style={{ color: "var(--muted)" }}>Bio</span>
                <span style={{ color: "var(--text-soft)", fontStyle: user.bio ? "normal" : "italic", lineHeight: "1.5" }}>
                  {user.bio || "No bio added yet."}
                </span>
              </div>

              {/* Friends & Messages Quick Access */}
              <div style={{ marginTop: "10px" }}>
                <Link
                  href="/messages"
                  className="btn btn-ghost btn-sm"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    padding: "9px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  My Friends &amp; Chats
                </Link>
              </div>

              {/* Log Out Action in Profile Section */}
              <div style={{ marginTop: "8px", paddingTop: "14px", borderTop: "1px solid var(--card-border)" }}>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="btn btn-ghost"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "var(--danger, #ef4444)",
                    borderColor: "rgba(239, 68, 68, 0.25)",
                    background: "rgba(239, 68, 68, 0.05)",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "10px",
                    borderRadius: "var(--r-sm)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Edit Form Card */}
          <div className="setup-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "6px", color: "var(--text)" }}>Edit Profile</h3>
            <p style={{ fontSize: "13px", color: "var(--text-soft)", marginBottom: "24px" }}>
              Update your account public details and avatar info.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {(validationError || error) && (
                <div style={{ padding: "12px 16px", background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: "var(--r-xs)", color: "var(--danger)", fontSize: "13px" }}>
                  {validationError || error}
                </div>
              )}

              {successMessage && (
                <div style={{ padding: "12px 16px", background: "var(--success-bg)", border: "1px solid var(--success)", borderRadius: "var(--r-xs)", color: "var(--success)", fontSize: "13px", fontWeight: "500" }}>
                  {successMessage}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profile Picture</label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "var(--bg-elevated)", border: "1px solid var(--card-border)", borderRadius: "var(--r-xs)", padding: "10px 14px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "var(--accent-grad)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#08080a"
                  }}>
                    {avatar ? (
                      <img src={avatar.startsWith("/public") ? `http://127.0.0.1:3003${avatar}` : avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (username || user.email).substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload-input"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="avatar-upload-input" className="btn btn-ghost btn-sm" style={{ cursor: "pointer", display: "inline-block", margin: 0, padding: "6px 12px", fontSize: "12px", border: "1px solid var(--card-border)" }}>
                      {isUploading ? "Uploading..." : "Choose Image"}
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--r-xs)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--r-xs)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--r-xs)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bio</label>
                <textarea
                  placeholder="Write a brief bio about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--r-xs)",
                    color: "var(--text)",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gradient"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginTop: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Saving changes..." : "Save Changes"}
              </button>
            </form>
          </div>

        </div>

        {/* ── Additional Section: Persistent Digital Twin & WhatsApp Assistant ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          {/* Card 3: Persistent Digital Twin */}
          <div className="glass-panel-luxury specular-top" style={{ padding: "26px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>✨</span>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>Persistent Digital Twin</h4>
              </div>
              <span className="glass-pill" style={{ color: "#00c98d", borderColor: "rgba(0, 201, 141, 0.3)" }}>
                {savedTwin ? "Active & Synced" : "Default Model"}
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.5, margin: 0 }}>
              Your personal AI avatar model used automatically across every virtual try-on session.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
              <img
                src={savedTwin?.avatarUrl || "/images/female_avatar.png"}
                alt="Digital Twin"
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--purple)" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {savedTwin ? `${savedTwin.gender === "male" ? "Male" : "Female"} · ${savedTwin.age || 25} yrs` : "Default Studio Avatar"}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--text-soft)" }}>
                  Skin: {savedTwin?.skinToneId ? SOUTH_ASIAN_SKIN_PROFILES.find(p => p.id === savedTwin.skinToneId)?.name || savedTwin.skinToneId : "Golden Wheatish (NC30)"}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  Proportions: {savedTwin?.heightCm || 170} cm · {savedTwin?.weightKg || 65} kg
                </span>
              </div>
            </div>

            <Link href="/studio" className="btn btn-gradient btn-sm" style={{ textAlign: "center", justifyContent: "center", marginTop: "auto" }}>
              Customize Twin in Studio →
            </Link>
          </div>

          {/* Card 4: WhatsApp Try-On Bot */}
          <div className="glass-panel-luxury specular-top" style={{ padding: "26px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>
                  WA
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>WhatsApp Try-On Assistant</h4>
              </div>
              <span className="glass-pill" style={{ color: user.phone ? "#25D366" : "var(--muted)", borderColor: user.phone ? "rgba(37, 211, 102, 0.3)" : "var(--border)" }}>
                {user.phone ? "Linked" : "Not Linked"}
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.5, margin: 0 }}>
              Send Zara, Myntra, or Amazon product links to our WhatsApp number and get an instant AI try-on on your twin.
            </p>

            <div style={{ padding: "12px 14px", background: "rgba(37, 211, 102, 0.06)", borderRadius: "var(--r-sm)", border: "1px solid rgba(37, 211, 102, 0.2)", fontSize: 12, color: "var(--text)" }}>
              {user.phone ? (
                <div>
                  <span style={{ color: "#25D366", fontWeight: 700 }}>✓ Linked Number:</span> {user.phone}
                </div>
              ) : (
                <span style={{ color: "var(--text-soft)" }}>
                  No phone number linked yet. Connect to activate WhatsApp 60-second try-on!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="btn btn-sm"
              style={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                color: "#fff",
                fontWeight: 700,
                justifyContent: "center",
                marginTop: "auto",
                border: "none",
              }}
            >
              {user.phone ? "Launch WhatsApp Assistant ↗" : "Link WhatsApp Number"}
            </button>
          </div>

        </div>

      </div>

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        userPhone={user.phone || ""}
      />
    </div>
  );
}
