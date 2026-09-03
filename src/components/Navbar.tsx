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
            <span className="navbar-logo-text">
              Threadflank<span className="navbar-logo-dot">.</span>
            </span>
          </Link>

          {/* ── Desktop Nav links (Hidden on Mobile) ── */}
          <div className="navbar-nav">
            <Link href="/studio" className={p?.startsWith("/studio") || p?.startsWith("/try-on") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Studio
            </Link>
            <Link href="/trending" className={p?.startsWith("/trending") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
              Trending
            </Link>
            <Link href="/wardrobe" className={p?.startsWith("/wardrobe") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
              </svg>
              Wardrobe
            </Link>
            <Link href="/looks" className={p?.startsWith("/looks") ? "active" : ""}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              Looks
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
                <>
                  <Link href="/profile" className="navbar-login-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {user.username || user.email.split("@")[0]}
                  </Link>
                  <button onClick={logout} className="navbar-cta-btn" style={{ border: "none", cursor: "pointer" }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
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
                  <span className="navbar-mobile-avatar-circle">
                    {(user.username || user.email || "U")[0].toUpperCase()}
                  </span>
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
          href="/studio"
          className={`mobile-nav-item ${p?.startsWith("/studio") || p?.startsWith("/try-on") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Studio</span>
        </Link>

        <Link
          href="/trending"
          className={`mobile-nav-item ${p?.startsWith("/trending") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Trending</span>
        </Link>

        <Link
          href="/wardrobe"
          className={`mobile-nav-item ${p?.startsWith("/wardrobe") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Wardrobe</span>
        </Link>

        <Link
          href="/looks"
          className={`mobile-nav-item ${p?.startsWith("/looks") ? "active" : ""}`}
        >
          <div className="mobile-nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <span className="mobile-nav-label">Looks</span>
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
