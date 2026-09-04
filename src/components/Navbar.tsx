"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/* ── Threadflank AI luxury logo mark ── */
function ThreadflankLogo() {
  return (
    <div
      className="navbar-logo-wrap"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 10px rgba(14, 165, 233, 0.2)",
        background: "#0c111d",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        flexShrink: 0,
      }}
    >
      <img
        src="/images/logo.png"
        alt="Threadflank Logo"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

export default function Navbar() {
  const p = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <>
      {/* ── Top Header Navigation ── */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <Link href="/" className="navbar-logo">
            <ThreadflankLogo />
            <span
              className="navbar-logo-text"
              style={{
                background: "linear-gradient(135deg, #00c98d 0%, #0ea5e9 50%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Threadflank<span style={{ WebkitTextFillColor: "transparent" }}>.</span>
            </span>
          </Link>

          {/* ── Desktop Nav links (Hidden on Mobile) ── */}
          <div className="navbar-nav">
            <Link href="/discover" className={p?.startsWith("/discover") || p?.startsWith("/trending") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Discover
            </Link>
            <Link href="/studio" className={p?.startsWith("/studio") || p?.startsWith("/try-on") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
              Drape
            </Link>
            <Link href="/outfits" className={p?.startsWith("/outfits") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M9 16l2 2 4-4"/>
              </svg>
              Outfits
            </Link>
            <Link href="/closet" className={p?.startsWith("/closet") || p?.startsWith("/wardrobe") || p?.startsWith("/looks") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
              </svg>
              Closet
            </Link>
            <Link href="/messages" className={p?.startsWith("/messages") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Messages
            </Link>
          </div>

          {/* ── Right Actions & Theme Toggle ── */}
          <div className="navbar-right">
            {/* Theme Switcher Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="navbar-theme-btn"
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            >
              {theme === "light" ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 11-7.07 7.07 5 5 0 017.07-7.07z"
                  />
                </svg>
              )}
            </button>

            {/* Desktop Auth Display */}
            <div className="navbar-desktop-auth">
              {user ? (
                <Link
                  href="/profile"
                  className="navbar-mobile-profile-btn"
                  aria-label="View Profile"
                  title="Profile"
                  style={{ width: 34, height: 34 }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar.startsWith("/public") ? `http://127.0.0.1:3003${user.avatar}` : user.avatar}
                      alt="Avatar"
                      style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="navbar-mobile-avatar-circle" style={{ width: 26, height: 26, fontSize: 12 }}>
                      {(user.username || user.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </Link>
              ) : (
                <>
                  <Link href="/pricing" className="navbar-login-btn">
                    Pricing
                  </Link>
                  <Link href="/login" className="navbar-login-btn">
                    Log in
                  </Link>
                  <Link href="/signup" className="navbar-cta-btn">
                    Start for free
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Auth Display (Clean & Compact) */}
            <div className="navbar-mobile-auth">
              {user ? (
                <Link
                  href="/profile"
                  className="navbar-mobile-profile-btn"
                  aria-label="View Profile"
                  title="Profile"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar.startsWith("/public") ? `http://127.0.0.1:3003${user.avatar}` : user.avatar}
                      alt="Avatar"
                      style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="navbar-mobile-avatar-circle">
                      {(user.username || user.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </Link>
              ) : (
                <Link href="/login" className="navbar-mobile-login-pill">
                  Log in
                </Link>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <Link
          href="/discover"
          className={`mobile-nav-item ${p?.startsWith("/discover") || p?.startsWith("/trending") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Discover</span>
        </Link>

        <Link
          href="/studio"
          className={`mobile-nav-item ${p?.startsWith("/studio") || p?.startsWith("/try-on") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Drape</span>
        </Link>

        <Link
          href="/outfits"
          className={`mobile-nav-item ${p?.startsWith("/outfits") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M9 16l2 2 4-4"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Outfits</span>
        </Link>

        <Link
          href="/closet"
          className={`mobile-nav-item ${p?.startsWith("/closet") || p?.startsWith("/wardrobe") || p?.startsWith("/looks") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Closet</span>
        </Link>

        <Link
          href="/messages"
          className={`mobile-nav-item ${p?.startsWith("/messages") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Messages</span>
        </Link>
      </nav>
    </>
  );
}
