"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

const FlowWave = dynamic(
  () => import("@/components/FlowWave").then((mod) => mod.FlowWave),
  { ssr: false }
);

/* ── scrolling items ── */
const MARQUEE = ["AI TRY-ON", "ANY STORE", "3D AVATAR", "MAKEUP", "REAL-TIME", "SAVE LOOKS", "WARDROBE", "SELFIE-POWERED"];
const STATUS  = ["AVATAR LOADED", "OUTFIT FITTED", "FABRIC RENDERED", "LOOK SAVED", "API ONLINE", "MIRROR ACTIVE"];

/* ── Tab definitions ── */
const TABS = [
  {
    id: "explore",
    label: "Explore",
    title: "Browse any store, try it instantly",
    bullets: [
      "Paste any Myntra, Zara or Amazon product link",
      "Our scraper extracts the garment image automatically",
      "Preview the item on your avatar in under 5 seconds",
      "No account needed for supported partner stores",
    ],
    code: [
      { t: "comment", v: "// fetch-garment.ts" },
      { t: "key", v: "POST", p: " /api/fetch-garment" },
      { t: "key", v: "url:", p: ' "https://myntra.com/..."' },
      { t: "divider" },
      { t: "ok", v: "og:image extracted" },
      { t: "ok", v: "JSON-LD candidate found" },
      { t: "ok", v: "garmentImageUrl → ready" },
    ],
  },
  {
    id: "tryon",
    label: "Try On",
    title: "AI try-on on your actual photo",
    bullets: [
      "Upload one selfie — it works for every outfit forever",
      "IDM-VTON model preserves your face, pose & background",
      "Ultra-realistic fabric draping and lighting simulation",
      "Supports upper body, lower body, full dresses",
    ],
    code: [
      { t: "comment", v: "// replicate-vton.log" },
      { t: "key", v: "model:", p: " cuuupid/idm-vton" },
      { t: "key", v: "category:", p: " upper_body" },
      { t: "divider" },
      { t: "ok", v: "status: starting" },
      { t: "muted", v: "status: processing · 42s" },
      { t: "ok", v: "succeeded · image ready" },
    ],
  },
  {
    id: "studio",
    label: "3D Studio",
    title: "Real-time 3D dressing room",
    bullets: [
      "Real-time 3D avatar with 6 mesh body zone classification",
      "Drag to rotate, scroll to zoom your full avatar",
      "Live color swap with zero latency on any zone",
      "Dedicated vanity mirror, wardrobe and lighting scene",
    ],
    code: [
      { t: "comment", v: "// AvatarViewer3D.tsx" },
      { t: "key", v: "renderer:", p: " WebGLRenderer" },
      { t: "key", v: "toneMapping:", p: " ACESFilmic" },
      { t: "divider" },
      { t: "ok", v: "GLB loaded · male.glb" },
      { t: "ok", v: "6 zones classified" },
      { t: "ok", v: "idle animation · 60fps" },
    ],
  },
  {
    id: "looks",
    label: "Save Looks",
    title: "Save & share your best outfits",
    bullets: [
      "Build a complete outfit across all 9 categories",
      "Save any combination as a named Look instantly",
      "Download the AI-generated try-on result photo",
      "Share your looks with friends or on social media",
    ],
    code: [
      { t: "comment", v: "// looks-timeline" },
      { t: "divider" },
      { t: "look", v: "Summer Casual", d: "1d ago" },
      { t: "look", v: "Office Chic",   d: "2d ago" },
      { t: "look", v: "Night Out",     d: "5d ago" },
    ],
  },
  {
    id: "makeup",
    label: "Makeup",
    title: "Makeup & accessories in one canvas",
    bullets: [
      "15 lipstick shades from nudes to deep reds",
      "15 eyeshadow tones from smoky to colorful",
      "Blush intensity slider from 0 to full coverage",
      "Add eyewear, jewellery and bags to complete the look",
    ],
    code: [
      { t: "comment", v: "// makeup-palette" },
      { t: "divider" },
      { t: "key", v: "lipstick:", p: " Ruby Red" },
      { t: "key", v: "eyeshadow:", p: " Smoky Charcoal" },
      { t: "key", v: "blush:", p: " Peach (45%)" },
      { t: "divider" },
      { t: "ok", v: "applied successfully" },
    ],
  },
];

/* ── Code preview component ── */
function CodePreview({ lines }: { lines: any[] }) {
  return (
    <div className="code-preview">
      <div className="code-preview-dots">
        <span className="cp-dot red"/>
        <span className="cp-dot yellow"/>
        <span className="cp-dot green"/>
      </div>
      <div className="code-preview-body font-mono">
        {lines.map((l: any, i: number) => {
          if (l.t === "comment")  return <div key={i} className="cp-comment">{l.v}</div>;
          if (l.t === "divider")  return <div key={i} className="cp-divider"/>;
          if (l.t === "ok")       return <div key={i} className="cp-ok"><span className="cp-check">✓</span>{l.v}</div>;
          if (l.t === "muted")    return <div key={i} className="cp-muted">{l.v}</div>;
          if (l.t === "key")      return <div key={i} className="cp-key"><span>{l.v}</span><span className="cp-val">{l.p}</span></div>;
          if (l.t === "look")     return <div key={i} className="cp-look"><span className="cp-look-dot"/><span>{l.v}</span><span className="cp-look-date">{l.d}</span></div>;
          if (l.t === "swatches") return <div key={i} className="cp-swatches">{(l.colors||[]).map((c: string, j: number)=><span key={j} style={{background:c}} className="cp-swatch"/>)}</div>;
          return null;
        })}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [tab, setTab] = useState("explore");
  const active = TABS.find(t => t.id === tab)!;

  return (
    <div className="nf-page">
      <FlowWave />

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="nf-hero">
        <div className="nf-hero-glow nf-hero-glow-1"/>
        <div className="nf-hero-glow nf-hero-glow-2"/>

        {/* Eyebrow Pill */}
        <div className="nf-eyebrow">
          <span className="nf-eyebrow-dot"/>
          Try on outfits, shoes, accessories &amp; makeup — from any store
        </div>

        {/* Headline */}
        <h1 className="nf-headline">
          Your virtual dressing room,<br/>
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
              <span className="cp-dot red"/><span className="cp-dot yellow"/><span className="cp-dot green"/>
              <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>try-on-pipeline · active</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-before">
                <span className="mockup-tag">Selfie</span>
                <div className="mockup-img-placeholder before-img">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
              <div className="mockup-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <div className="mockup-after">
                <span className="mockup-tag success">AI Try-on</span>
                <div className="mockup-img-placeholder after-img">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>
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

      {/* ─── Platform Strip ───────────────────────────────────────── */}
      <div className="nf-platform-strip">
        <span className="nf-platform-label">Threadflank</span>
        <span className="nf-platform-sep">WORKS WITH</span>
        {["Myntra","Amazon","Zara","ASOS","Flipkart","H&M","Nykaa"].map(s=>(
          <span key={s} className="nf-platform-chip">{s}</span>
        ))}
        <span className="nf-platform-chip nf-platform-chip-any">Any store →</span>
      </div>

      {/* ─── Four Alternating Feature Sections ─────────────────────── */}
      <section className="nf-features-alternating">
        
        {/* Section A — AI Try-On (flagship feature) */}
        <div className="alt-feature-row">
          <div className="alt-feature-visual">
            <div className="alt-feature-card">
              <div className="card-bar">
                <span className="cp-dot red"/><span className="cp-dot yellow"/><span className="cp-dot green"/>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>tryon-pipeline.sh</span>
              </div>
              <div className="card-image-content">
                <img src="/images/feature-tryon.jpg" alt="AI Try-On Demo" className="feature-demo-img" />
              </div>
            </div>
          </div>
          <div className="alt-feature-text">
            <span className="alt-feature-eyebrow">AI Try-on</span>
            <h2 className="alt-feature-headline">See it on you before you buy it</h2>
            <p className="alt-feature-body">
              Upload a selfie and basic measurements, paste any product link or image, and Threadflank generates a realistic render of you wearing it. Your face and body remain untouched—only the outfit changes.
            </p>
            <Link href="/setup" className="alt-feature-btn">
              Try it now
            </Link>
          </div>
        </div>

        {/* Section B — Wardrobe & Event Planning */}
        <div className="alt-feature-row alt-reverse">
          <div className="alt-feature-text">
            <span className="alt-feature-eyebrow">Wardrobe</span>
            <h2 className="alt-feature-headline">Never wonder what to wear again</h2>
            <p className="alt-feature-body">
              Save outfit combinations to a personal wardrobe board before buying. Mix and match for an upcoming event, compare options side by side, and decide without trying on 10 physical outfits.
            </p>
            <Link href="/wardrobe" className="alt-feature-btn">
              Build your wardrobe
            </Link>
          </div>
          <div className="alt-feature-visual">
            <div className="alt-feature-card">
              <div className="card-bar">
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>wardrobe-board // event-planning</span>
              </div>
              <div className="card-image-content">
                <img src="/images/feature-wardrobe.jpg" alt="Wardrobe planning" className="feature-demo-img" />
              </div>
            </div>
          </div>
        </div>

        {/* Section C — Share & Get Opinions */}
        <div className="alt-feature-row">
          <div className="alt-feature-visual">
            <div className="alt-feature-card">
              <div className="card-bar">
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>live-share-session</span>
              </div>
              <div className="card-image-content">
                <img src="/images/feature-social.jpg" alt="Social share session" className="feature-demo-img" />
              </div>
            </div>
          </div>
          <div className="alt-feature-text">
            <span className="alt-feature-eyebrow">Social</span>
            <h2 className="alt-feature-headline">Get a second opinion, instantly</h2>
            <p className="alt-feature-body">
              Share a look with friends via chat or video call inside the app and get real-time feedback before deciding. No more group-chat screenshots.
            </p>
            <Link href="/messages" className="alt-feature-btn">
              See how it works
            </Link>
          </div>
        </div>

        {/* Section D — Trending Feed */}
        <div className="alt-feature-row alt-reverse">
          <div className="alt-feature-text">
            <span className="alt-feature-eyebrow">Discover</span>
            <h2 className="alt-feature-headline">Fresh drops, styled for you</h2>
            <p className="alt-feature-body">
              Browse trending and new arrivals from partner brands, curated into a feed. Try any of it on your avatar with just one tap.
            </p>
            <Link href="/trending" className="alt-feature-btn">
              Explore trending
            </Link>
          </div>
          <div className="alt-feature-visual">
            <div className="alt-feature-card">
              <div className="card-bar">
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>trending-feed-curated</span>
              </div>
              <div className="card-image-content">
                <img src="/images/feature-discover.jpg" alt="Discover trending outfits" className="feature-demo-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Status Ticker ────────────────────────────────────────── */}
      <div className="nf-status-bar">
        <div className="nf-status-track">
          {[...STATUS,...STATUS].map((item,i)=>(
            <span key={i} className="nf-status-item font-mono">
              <span className="nf-status-dot"/>{item}<span className="nf-marquee-sep">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Tabbed Feature Section ───────────────────────────────── */}
      <section className="nf-tabs-section">
        <h2 className="nf-tabs-headline">
          The operating system<br/>for your personal wardrobe.
        </h2>
        <div className="nf-tabs-layout">
          {/* sidebar */}
          <div className="nf-tabs-sidebar">
            {TABS.map(t=>(
              <button
                key={t.id}
                className={`nf-tab-btn${tab===t.id?" nf-tab-btn-active":""}`}
                onClick={()=>setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* content */}
          <div className="nf-tabs-content">
            <h3 className="nf-tabs-content-title">{active.title}</h3>
            <ul className="nf-tabs-bullets">
              {active.bullets.map((b,i)=>(
                <li key={i} className="nf-bullet">
                  <span className="nf-bullet-icon">›</span>{b}
                </li>
              ))}
            </ul>
          </div>
          {/* code preview */}
          <div className="nf-tabs-preview">
            <CodePreview lines={active.code}/>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────── */}
      <section className="nf-stats-bar">
        {[
          { val:"15+",   label:"Lipstick shades" },
          { val:"6",     label:"3D body zones" },
          { val:"9",     label:"Category types" },
          { val:"< 90s", label:"AI try-on time" },
        ].map(s=>(
          <div key={s.label} className="nf-stat-item">
            <div className="nf-stat-val">{s.val}</div>
            <div className="nf-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="nf-footer">
        <div className="nf-footer-inner">
          <div className="nf-footer-top">
            <div className="nf-footer-brand">
              <div className="nf-footer-logo">
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="tf-footer-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00c98d"/><stop offset="1" stopColor="#0ea5e9"/>
                    </linearGradient>
                  </defs>
                  <rect width="32" height="32" rx="8" fill="url(#tf-footer-grad)"/>
                  <path d="M16 8a3 3 0 013 3h-2a1 1 0 00-2 0 1 1 0 01-1-1 3 3 0 012-2z" fill="white"/>
                  <path d="M7 15l9-4 9 4v2.5l-9-4-9 4V15z" fill="white" fillOpacity="0.95"/>
                  <rect x="7" y="19" width="18" height="2.5" rx="1.25" fill="white" fillOpacity="0.7"/>
                  <rect x="7" y="23" width="13" height="2.5" rx="1.25" fill="white" fillOpacity="0.45"/>
                </svg>
                <span className="nf-footer-brand-name">Threadflank<span style={{color:"var(--purple)"}}>.</span></span>
              </div>
              <p className="nf-footer-tagline">Try anything. Wear everything.</p>
            </div>
            <div className="nf-footer-cols">
              <div className="nf-footer-col">
                <div className="nf-footer-col-title">Product</div>
                <Link href="/studio"   className="nf-footer-link">Studio</Link>
                <Link href="/wardrobe" className="nf-footer-link">Wardrobe</Link>
                <Link href="/looks"    className="nf-footer-link">Saved looks</Link>
                <Link href="/trending" className="nf-footer-link">Trending</Link>
              </div>
              <div className="nf-footer-col">
                <div className="nf-footer-col-title">Features</div>
                <span className="nf-footer-link">AI Try-on</span>
                <Link href="/setup" className="nf-footer-link">Digital twin</Link>
                <span className="nf-footer-link">Makeup studio</span>
                <span className="nf-footer-link">Link scraper</span>
              </div>
              <div className="nf-footer-col">
                <div className="nf-footer-col-title">Stores</div>
                {["Myntra","Amazon","ASOS","Zara","H&M","Nykaa"].map(s=>(
                  <span key={s} className="nf-footer-link">{s}</span>
                ))}
              </div>
              <div className="nf-footer-col">
                <div className="nf-footer-col-title">Company</div>
                <span className="nf-footer-link">About</span>
                <span className="nf-footer-link">Privacy</span>
                <span className="nf-footer-link">Terms</span>
                <span className="nf-footer-link">Contact</span>
              </div>
            </div>
          </div>
          <div className="nf-footer-bottom">
            <div className="nf-footer-status">
              <span className="status-dot status-dot-green"/>
              All systems operational
            </div>
            <div className="nf-footer-copy">© 2026 Threadflank. All rights reserved.</div>
          </div>
        </div>
        <div className="nf-footer-watermark">THREADFLANK</div>
      </footer>
    </div>
  );
}
