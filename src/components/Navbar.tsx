"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/* ── Threadflank logo mark ── */
function ThreadflankLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tf-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00c98d"/>
          <stop offset="1" stopColor="#0ea5e9"/>
        </linearGradient>
      </defs>
      {/* Rounded square base */}
      <rect width="32" height="32" rx="8" fill="url(#tf-grad)"/>
      {/* Hanger hook */}
      <path d="M16 8a3 3 0 013 3h-2a1 1 0 00-2 0 1 1 0 01-1-1 3 3 0 012-2z" fill="white"/>
      {/* Hanger shoulders + Server blade slot 1 */}
      <path d="M7 15l9-4 9 4v2.5l-9-4-9 4V15z" fill="white" fillOpacity="0.95"/>
      {/* Server blade slot 2 */}
      <rect x="7" y="19" width="18" height="2.5" rx="1.25" fill="white" fillOpacity="0.7"/>
      {/* Server blade slot 3 */}
      <rect x="7" y="23" width="13" height="2.5" rx="1.25" fill="white" fillOpacity="0.45"/>
    </svg>
  );
}

export default function Navbar() {
  const p = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const pref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const init = saved || pref || "dark";
    setTheme(init);
    document.documentElement.setAttribute("data-theme", init);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const currentTheme = mounted ? theme : "dark";

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Logo ── */}
        <Link href="/" className="navbar-logo">
          <ThreadflankLogo />
          <span className="navbar-logo-text">
            Threadflank<span className="navbar-logo-dot">.</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
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

        {/* ── Right CTA ── */}
        <div className="navbar-right">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-soft)",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background 0.15s, color 0.15s",
              marginRight: "8px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--card-border-hover)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "var(--text-soft)";
            }}
          >
            {currentTheme === "light" ? (
              // Moon Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              // Sun Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>

          <Link href="/setup" className="navbar-login-btn">
            Log in
          </Link>
          <Link href="/setup" className="navbar-cta-btn">
            Start free
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

      </div>
    </nav>
  );
}
