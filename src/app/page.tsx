"use client";
import Link from "next/link";
import { useState } from "react";

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
      { t: "swatches", colors: ["#dc143c","#c71585","#ff6b6b","#e75480","#8b0000","#d2691e","#ff4500","#4b0082"] },
      { t: "divider" },
      { t: "ok", v: "Lipstick · 15 shades" },
      { t: "ok", v: "Eyeshadow · 15 tones" },
      { t: "muted", v: "Blush · 0–100 intensity" },
    ],
  },
];

/* ── 6-panel feature grid ── */
const PANELS = [
  {
    label: "WARDROBE",
    desc: "Every item you own in one smart digital closet.",
    rows: [
      { tag: "👕 TOP",    val: "Oxford Shirt · #f5f5f5" },
      { tag: "👖 BOTTOM", val: "Black Slim Jeans" },
      { tag: "👟 SHOES",  val: "White Sneakers" },
      { tag: "👜 BAG",    val: "Leather Tote" },
    ],
    stat: "24 items indexed",
  },
  {
    label: "AI TRY-ON",
    desc: "Upload a selfie, paste a link — AI does the rest.",
    rows: [
      { tag: "model",  val: "IDM-VTON" },
      { tag: "input",  val: "selfie + garment image" },
    ],
    ok: ["Processing complete · 42s", "Result image ready"],
  },
  {
    label: "3D STUDIO",
    desc: "Real-time 3D room with lighting and live color swap.",
    rows: [
      { tag: "renderer", val: "WebGL · 60fps" },
      { tag: "avatar",   val: "male.glb loaded" },
    ],
    ok: ["Torso zone → #ffffff", "Legs zone → #1e3a5f"],
  },
  {
    label: "MAKEUP",
    desc: "Apply lipstick, eyeshadow and blush before you buy.",
    swatches: ["#dc143c","#c71585","#ff6b6b","#e75480","#8b0000","#d2691e"],
    ok: ["Lipstick · Crimson Red", "Eyeshadow · Smoky Plum"],
  },
  {
    label: "LINK SCRAPER",
    desc: "Paste any product URL and we extract the image.",
    rows: [
      { tag: "source", val: "myntra.com/product/…" },
    ],
    ok: ["og:image found", "JSON-LD extracted", "garmentUrl returned"],
  },
  {
    label: "SAVED LOOKS",
    desc: "Your curated outfits, ready to wear or share.",
    looks: ["Summer Casual · 1d", "Office Chic · 2d", "Night Out · 5d"],
    stat: "3 looks saved",
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

      {/* ─── Top marquee ──────────────────────────────────────────── */}
      <div className="nf-marquee-bar">
        <div className="nf-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="nf-marquee-item font-mono">
              {item}<span className="nf-marquee-sep">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="nf-hero">
        <div className="nf-hero-glow nf-hero-glow-1"/>
        <div className="nf-hero-glow nf-hero-glow-2"/>

        {/* eyebrow pill */}
        <div className="nf-eyebrow">
          <span className="nf-eyebrow-dot"/>
          Try on outfits, shoes, accessories &amp; makeup — from any store
        </div>

        {/* headline */}
        <h1 className="nf-headline">
          Your virtual dressing room,<br/>
          <span className="nf-headline-accent">powered by AI.</span>
        </h1>

        {/* subhead */}
        <p className="nf-subhead">
          Build your digital twin once. Then try on anything from Myntra, Zara,
          ASOS or any store — on your avatar, before spending a rupee.
        </p>

        {/* CTAs — exact Northflank layout */}
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

        {/* Hero visual — floating dashboard card */}
        <div className="nf-hero-visual">
          <div className="nf-hero-card">
            <div className="nf-hero-card-bar">
              <div style={{display:"flex",gap:6}}>
                <span className="cp-dot red"/><span className="cp-dot yellow"/><span className="cp-dot green"/>
              </div>
              <span className="font-mono" style={{fontSize:11,color:"var(--muted)"}}>drape — virtual studio</span>
              <span className="nf-hero-badge"><span className="nf-status-dot"/>LIVE</span>
            </div>
            <div className="nf-hero-card-body">
              {/* Left: avatar placeholder */}
              <div className="nf-hero-avatar">
                <div className="nf-hero-avatar-figure">
                  <div className="nf-hero-avatar-head"/>
                  <div className="nf-hero-avatar-body"/>
                </div>
                <div className="nf-hero-avatar-label font-mono">avatar · ready</div>
              </div>
              {/* Right: outfit slots */}
              <div className="nf-hero-slots">
                {[
                  { emoji:"👕", label:"Top",     val:"Oxford Shirt",  color:"#00c98d" },
                  { emoji:"👖", label:"Bottom",  val:"Slim Chinos",   color:"#0ea5e9" },
                  { emoji:"👟", label:"Shoes",   val:"White AF1",     color:"#a3a3a3" },
                  { emoji:"💄", label:"Makeup",  val:"Ruby Red",      color:"#dc143c" },
                ].map(s => (
                  <div key={s.label} className="nf-hero-slot">
                    <span className="nf-hero-slot-emoji">{s.emoji}</span>
                    <div className="nf-hero-slot-info">
                      <span className="nf-hero-slot-label font-mono">{s.label}</span>
                      <span className="nf-hero-slot-val">{s.val}</span>
                    </div>
                    <span className="nf-hero-slot-dot" style={{background:s.color, boxShadow:`0 0 6px ${s.color}66`}}/>
                  </div>
                ))}
                <div className="nf-hero-try-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Generate try-on
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6-panel feature grid ─────────────────────────────────── */}
      <section className="nf-panel-section">
        <div className="nf-panel-grid">
          {PANELS.map(p => (
            <div key={p.label} className="nf-panel-card">
              <div className="nf-panel-label font-mono">
                <span className="nf-panel-icon-dot"/>{p.label}
              </div>
              <p className="nf-panel-desc">{p.desc}</p>
              <div className="panel-preview">
                {p.swatches && (
                  <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                    {p.swatches.map(c=><div key={c} style={{width:16,height:16,borderRadius:"50%",background:c,flexShrink:0}}/>)}
                  </div>
                )}
                {p.rows?.map((r,i) => (
                  <div key={i} className="panel-row">
                    <span className="panel-tag mono-muted">{r.tag}</span>
                    <span className="panel-val">{r.val}</span>
                  </div>
                ))}
                {(p.rows || p.swatches) && p.ok && <div className="panel-divider"/>}
                {p.ok?.map((v,i) => (
                  <div key={i} className="panel-row">
                    <span className="mono-success">✓</span>
                    <span className="panel-val">{v}</span>
                  </div>
                ))}
                {p.looks?.map((v,i) => (
                  <div key={i} className="panel-row">
                    <span className="tab-preview-dot green" style={{flexShrink:0}}/>
                    <span className="panel-val">{v}</span>
                  </div>
                ))}
                {p.stat && <><div className="panel-divider"/><div className="panel-stat"><span className="mono-success">{p.stat.split(" ")[0]}</span> <span className="mono-muted">{p.stat.split(" ").slice(1).join(" ")}</span></div></>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Platform strip ───────────────────────────────────────── */}
      <div className="nf-platform-strip">
        <span className="nf-platform-label">Threadflank</span>
        <span className="nf-platform-sep">WORKS WITH</span>
        {["Myntra","Amazon","Zara","ASOS","Flipkart","H&M","Nykaa"].map(s=>(
          <span key={s} className="nf-platform-chip">{s}</span>
        ))}
        <span className="nf-platform-chip nf-platform-chip-any">Any store →</span>
      </div>

      {/* ─── Status ticker ────────────────────────────────────────── */}
      <div className="nf-status-bar">
        <div className="nf-status-track">
          {[...STATUS,...STATUS].map((item,i)=>(
            <span key={i} className="nf-status-item font-mono">
              <span className="nf-status-dot"/>{item}<span className="nf-marquee-sep">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Trust strip ──────────────────────────────────────────── */}
      <section className="nf-trust-section">
        <p className="nf-trust-headline">
          Trusted by <span className="gradient-text">style-forward</span> shoppers &amp; fashion lovers
        </p>
        <div className="nf-logo-cloud">
          {["MYNTRA","ZARA","H&M","ASOS","NYKAA","AMAZON FASHION","AJIO","MEESHO"].map(b=>(
            <div key={b} className="nf-logo-chip font-mono">{b}</div>
          ))}
        </div>
      </section>

      {/* ─── Tabbed feature section ───────────────────────────────── */}
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

      {/* ─── Stats bar ────────────────────────────────────────────── */}
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
                <Link href="/looks"    className="nf-footer-link">Saved Looks</Link>
                <Link href="/trending" className="nf-footer-link">Trending</Link>
              </div>
              <div className="nf-footer-col">
                <div className="nf-footer-col-title">Features</div>
                <span className="nf-footer-link">AI Try-On</span>
                <Link href="/setup" className="nf-footer-link">Digital Twin</Link>
                <span className="nf-footer-link">Makeup Studio</span>
                <span className="nf-footer-link">Link Scraper</span>
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
