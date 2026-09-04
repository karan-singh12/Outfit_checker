"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const FlowWave = dynamic(
  () => import("@/components/FlowWave").then((mod) => mod.FlowWave),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="nf-page">
      <FlowWave />

      {/* ─── Hero Section (Waves visible in background) ───────────── */}
      <section className="nf-hero">
        <div className="nf-hero-glow nf-hero-glow-1" />
        <div className="nf-hero-glow nf-hero-glow-2" />

        {/* Eyebrow Pill */}
        <div className="nf-eyebrow">
          <span className="nf-eyebrow-dot" />
          Try on outfits, shoes, accessories &amp; makeup — from any store
        </div>

        {/* Headline */}
        <h1 className="nf-headline">
          Your virtual dressing room,<br />
          <span className="nf-headline-accent">powered by AI.</span>
        </h1>

        {/* Subhead */}
        <p className="nf-subhead">
          Upload one selfie. See yourself — same face, same body — wearing any outfit from Myntra, Zara, ASOS or any store. No mannequins, no guesswork.
        </p>

        {/* CTAs */}
        <div className="nf-cta-row">
          <Link href="/setup" className="nf-btn-primary">
            Start for free
            <span className="nf-btn-kbd">S</span>
          </Link>
          <Link href="/studio" className="nf-btn-ghost">
            Try demo studio
            <span className="nf-btn-kbd nf-btn-kbd-ghost">D</span>
          </Link>
        </div>

        {/* Hero Visual Mockup */}
        <div className="nf-hero-visual">
          <div className="nf-hero-tryon-mockup">
            <div className="mockup-header">
              <span className="cp-dot red" /><span className="cp-dot yellow" /><span className="cp-dot green" />
              <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>try-on-pipeline · active</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-before">
                <span className="mockup-tag">Selfie</span>
                <div className="mockup-img-placeholder before-img">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              </div>
              <div className="mockup-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </div>
              <div className="mockup-after">
                <span className="mockup-tag success">AI Try-on</span>
                <div className="mockup-img-placeholder after-img">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" /></svg>
                </div>
              </div>
            </div>
            <div className="mockup-footer">
              <img src="/images/hero-tryon-demo.jpg" alt="Try-On Demo" className="mockup-demo-image" />
              <div className="mockup-footer-text">
                <span className="font-mono" style={{ fontSize: 12, color: "var(--purple)" }}>✓ VTON Pipeline finished</span>
                <span style={{ fontSize: 11, color: "var(--text-soft)" }}>preserves your face, pose &amp; background perfectly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Frosted Blur Layer (Starts below Hero, covers till footer) ─── */}
      <div
        className="nf-frosted-container"
        style={{
          position: "relative",
          zIndex: 2,
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          background: "linear-gradient(180deg, color-mix(in srgb, var(--bg) 60%, transparent) 0%, color-mix(in srgb, var(--bg) 92%, transparent) 14%, var(--bg) 100%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* ─── Platform Strip ──────────────────────────────────────── */}
        <div className="nf-platform-strip">
          <span className="nf-platform-sep">WORKS WITH</span>
          {["Myntra", "Amazon", "Zara", "ASOS", "Flipkart", "H&M", "Nykaa"].map((s) => (
            <span key={s} className="nf-platform-chip">{s}</span>
          ))}
          <span className="nf-platform-chip nf-platform-chip-any">Any store link →</span>
        </div>

        {/* ─── Features Grid Section ───────────────────────────────── */}
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 24px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 99,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-soft)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
              Platform Features
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginBottom: 14 }}>
              Everything you need to dress <span style={{ background: "linear-gradient(135deg, #00c98d, #0ea5e9, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>with absolute confidence</span>
            </h2>
            <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
              From high-fidelity virtual draping to contextual AI occasion planners — all in one unified wardrobe studio.
            </p>
          </div>

          {/* 6 Grid Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 22 }}>

            {/* Card 1: AI Try-On (Drape) */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "30px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,201,141,0.45)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle, rgba(0,201,141,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(0,201,141,0.18), rgba(0,201,141,0.05))", border: "1px solid rgba(0,201,141,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00c98d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>AI Try-On &amp; Drape</p>
                <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.65 }}>
                  Upload one selfie. See yourself wearing garments from any store link or image with photorealistic fabric physics, exact body preservation, and natural lighting.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {["IDM-VTON Engine", "Any Store Link", "Exact Face & Body"].map((t) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(0,201,141,0.08)", border: "1px solid rgba(0,201,141,0.2)", fontSize: 11, color: "#00c98d", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <Link href="/studio" style={{ fontSize: 13, fontWeight: 600, color: "#00c98d", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", marginTop: 4 }}>
                Open Drape Studio
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Card 2: Occasion Planner */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "30px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.05))", border: "1px solid rgba(139,92,246,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M9 16l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>AI Occasion Planner</p>
                <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.65 }}>
                  Tell AI about your destination, weather, and dress code. It automatically generates complete outfits from what you already own, highlighting missing gap items with shoppable links.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {["Event Context", "Gap Detection", "Wardrobe Match"].map((t) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", fontSize: 11, color: "#8b5cf6", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <Link href="/outfits" style={{ fontSize: 13, fontWeight: 600, color: "#8b5cf6", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", marginTop: 4 }}>
                Plan an Occasion
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Card 3: Digital Closet */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "30px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(14,165,233,0.45)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(14,165,233,0.05))", border: "1px solid rgba(14,165,233,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Digital Closet &amp; Looks</p>
                <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.65 }}>
                  Catalogue owned garments across 9 categories. Save full outfits as curated Looks, track wear frequency, and mix &amp; match pieces without physical clutter.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {["9 Categories", "Saved Outfits", "Cost-Per-Wear"].map((t) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", fontSize: 11, color: "#0ea5e9", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <Link href="/closet" style={{ fontSize: 13, fontWeight: 600, color: "#0ea5e9", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", marginTop: 4 }}>
                Explore My Closet
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Card 4: Discover Feed */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "30px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.05))", border: "1px solid rgba(245,158,11,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Editorial Discover Feed</p>
                <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.65 }}>
                  Discover new drops and trending pieces from top partner fashion brands. Tap any story or item to instantly render it on your avatar in real time.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {["Brand Stories", "1-Tap Try-On", "Curated Drops"].map((t) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 11, color: "#f59e0b", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <Link href="/discover" style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", marginTop: 4 }}>
                Browse Discover
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Card 5: Makeup & Cosmetics */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "30px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(236,72,153,0.45)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(236,72,153,0.05))", border: "1px solid rgba(236,72,153,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Makeup &amp; Accessory Studio</p>
                <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.65 }}>
                  Experiment with 15+ lipstick shades, eyeshadow palettes, and blush intensities alongside sunglasses and jewellery to see your head-to-toe look.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {["15+ Lip Shades", "Eyeshadow", "Jewellery & Eyewear"].map((t) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", fontSize: 11, color: "#ec4899", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <Link href="/studio" style={{ fontSize: 13, fontWeight: 600, color: "#ec4899", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", marginTop: 4 }}>
                Try Makeup in Studio
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Card 6: Second Opinion & Social */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "30px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.45)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Instant Second Opinion</p>
                <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.65 }}>
                  Share outfit drafts directly with friends or stylists in-app via messages. Get live feedback, votes, and suggestions before completing a purchase.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {["In-App Chat", "Share Look Cards", "Friend Feedback"].map((t) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11, color: "#10b981", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <Link href="/messages" style={{ fontSize: 13, fontWeight: 600, color: "#10b981", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", marginTop: 4 }}>
                Open Messages
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

          </div>
        </section>

        {/* ─── 3-Step Simple Flow Section ───────────────────────────── */}
        <section style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px 70px" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: "44px 36px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Simple Workflow</span>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginTop: 6 }}>How Threadflank Works in 3 Steps</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
              {[
                { step: "01", title: "Add Your Avatar", desc: "Upload one clear photo or configure an AI mannequin with your exact height and proportions." },
                { step: "02", title: "Select or Paste Garment", desc: "Paste any store link from Myntra, Zara, Amazon or upload photo directly from your closet." },
                { step: "03", title: "Fit, Style & Plan", desc: "View the realistic drape render, pair with accessories, and save to your upcoming occasion schedule." }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: "20px 22px", borderRadius: 16, background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", opacity: 0.85, marginBottom: 8, fontFamily: "monospace" }}>{item.step}</div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Strip ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 760, margin: "0 auto 80px", padding: "0 24px", textAlign: "center" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 28,
            padding: "52px 40px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.12)"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)", pointerEvents: "none" }} />
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-soft)", marginBottom: 16 }}>Start today — it's free</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, color: "var(--text)", lineHeight: 1.25, marginBottom: 14 }}>
              Your perfect outfit is already in your closet.
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-soft)", lineHeight: 1.65, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
              Threadflank helps you find it, drape it on your real body, and try everything else before spending a rupee.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/setup" className="nf-btn-primary" style={{ minWidth: 160, justifyContent: "center" }}>
                Get started free
              </Link>
              <Link href="/studio" className="nf-btn-ghost" style={{ minWidth: 140, justifyContent: "center" }}>
                Try demo studio
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Stats Metrics Bar ─────────────────────────────────────── */}
        <section className="nf-stats-bar" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
          {[
            { val: "< 90s", label: "AI try-on render speed" },
            { val: "9", label: "Wardrobe categories" },
            { val: "15+", label: "Cosmetic & makeup shades" },
            { val: "Any", label: "Store links supported" },
          ].map((s) => (
            <div key={s.label} className="nf-stat-item">
              <div className="nf-stat-val">{s.val}</div>
              <div className="nf-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ─── Footer ───────────────────────────────────────────────── */}
        <footer className="nf-footer" style={{ borderTop: "none" }}>
          <div className="nf-footer-inner">
            <div className="nf-footer-top">
              <div className="nf-footer-brand">
                <div className="nf-footer-logo">
                  <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", background: "#0c111d", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                    <img src="/images/logo.png" alt="Threadflank Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <span className="nf-footer-brand-name" style={{ background: "linear-gradient(135deg, #00c98d 0%, #0ea5e9 50%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Threadflank<span style={{ WebkitTextFillColor: "transparent" }}>.</span>
                  </span>
                </div>
                <p className="nf-footer-tagline">Try anything. Wear everything.</p>
              </div>

              <div className="nf-footer-cols">
                <div className="nf-footer-col">
                  <div className="nf-footer-col-title">Product</div>
                  <Link href="/studio" className="nf-footer-link">Drape</Link>
                  <Link href="/discover" className="nf-footer-link">Discover</Link>
                  <Link href="/outfits" className="nf-footer-link">Outfits</Link>
                  <Link href="/closet" className="nf-footer-link">Closet</Link>
                  <Link href="/pricing" className="nf-footer-link">Pricing</Link>
                  <Link href="/messages" className="nf-footer-link">Messages</Link>
                </div>
                <div className="nf-footer-col">
                  <div className="nf-footer-col-title">Features</div>
                  <Link href="/studio" className="nf-footer-link">AI Try-on</Link>
                  <Link href="/setup" className="nf-footer-link">Digital twin</Link>
                  <Link href="/outfits" className="nf-footer-link">Occasion Planner</Link>
                  <Link href="/studio" className="nf-footer-link">Makeup studio</Link>
                </div>
                <div className="nf-footer-col">
                  <div className="nf-footer-col-title">Stores</div>
                  {["Myntra", "Amazon", "ASOS", "Zara", "H&M", "Nykaa"].map((s) => (
                    <span key={s} className="nf-footer-link">{s}</span>
                  ))}
                </div>
                <div className="nf-footer-col">
                  <div className="nf-footer-col-title">Company</div>
                  <Link href="/pricing" className="nf-footer-link">Plans &amp; Pricing</Link>
                  <span className="nf-footer-link">About</span>
                  <span className="nf-footer-link">Privacy</span>
                  <span className="nf-footer-link">Terms</span>
                  <span className="nf-footer-link">Contact</span>
                </div>
              </div>
            </div>

            <div className="nf-footer-bottom">
              <div className="nf-footer-status">
                <span className="status-dot status-dot-green" />
                All systems operational
              </div>
              <div className="nf-footer-copy">© 2026 Threadflank. All rights reserved.</div>
            </div>
          </div>

          <div
            className="nf-footer-watermark"
            style={{
              background: "linear-gradient(135deg, #00c98d 0%, #0ea5e9 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 1
            }}
          >
            THREADFLANK
          </div>
        </footer>
      </div>
    </div>
  );
}
