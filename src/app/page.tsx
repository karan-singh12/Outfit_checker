"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const FlowWave = dynamic(
  () => import("@/components/FlowWave").then((mod) => mod.FlowWave),
  { ssr: false }
);

interface GarmentDemo {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  fabric: string;
  matchScore: string;
  thumbImg: string;
  garmentImg: string;
  resultImg: string;
  colorHex: string;
  specNotes: string;
}

const DEMO_GARMENTS: GarmentDemo[] = [
  {
    id: "blazer",
    name: "Double-Breasted Wool Blazer",
    brand: "ZARA Tailoring",
    category: "Outerwear",
    price: "₹6,990",
    fabric: "Structured Virgin Wool blend",
    matchScore: "99.4%",
    thumbImg: "/images/blazer.png",
    garmentImg: "/images/blazer.png",
    resultImg: "/images/hero-tryon-demo.jpg",
    colorHex: "#1e293b",
    specNotes: "Micro-seam retention · Accurate shoulder drop · Zero torso warping",
  },
  {
    id: "gown",
    name: "Emerald Bias-Cut Satin Gown",
    brand: "ASOS Luxe",
    category: "Evening Dress",
    price: "₹8,490",
    fabric: "High-sheen mulberry silk satin",
    matchScore: "98.9%",
    thumbImg: "/images/satin_dress.png",
    garmentImg: "/images/satin_dress.png",
    resultImg: "/images/feature-tryon.jpg",
    colorHex: "#00c98d",
    specNotes: "Specular sheen lighting · Dynamic cloth cascade · Biometric lock",
  },
  {
    id: "trench",
    name: "Oversized Structured Trench Coat",
    brand: "MANGO Studio",
    category: "Outerwear",
    price: "₹11,990",
    fabric: "Water-resistant cotton gabardine",
    matchScore: "99.1%",
    thumbImg: "/images/trench_coat.png",
    garmentImg: "/images/trench_coat.png",
    resultImg: "/images/look_formal.png",
    colorHex: "#f59e0b",
    specNotes: "Lapel crease physics · Natural armhole flex · Background blend",
  },
];

const CODE_SNIPPETS = {
  html: `<!-- 1. Include Threadflank VTON Engine SDK -->
<script src="https://cdn.threadflank.com/v2/drape-widget.min.js" async></script>

<!-- 2. Mount Try-On Button inside your Product Details Page -->
<button 
  class="tf-tryon-trigger"
  data-store-id="zara_retail_in"
  data-product-sku="ZR-90214-BLZ"
  data-product-url="https://zara.com/in/tailored-blazer"
  data-garment-image="https://cdn.store.com/garment.jpg">
  ✨ Try on Your Body (Threadflank AI)
</button>`,

  shopify: `{% comment %} Threadflank Shopify App Snippet (theme.liquid) {% endcomment %}
{{ 'threadflank-vton.css' | asset_url | stylesheet_tag }}

<div id="threadflank-widget-container"
     data-customer-id="{{ customer.id | default: 'guest' }}"
     data-product-id="{{ product.id }}"
     data-product-title="{{ product.title | escape }}"
     data-product-image="{{ product.featured_image | image_url: width: 1200 }}"
     data-product-price="{{ product.price | money_without_currency }}">
</div>
<script src="https://cdn.threadflank.com/shopify/vton-embed.js" defer></script>`,

  react: `import { ThreadflankTryOnButton } from '@threadflank/react-sdk';

export function ProductDetails({ product }) {
  return (
    <div className="product-actions">
      <ThreadflankTryOnButton
        apiKey={process.env.NEXT_PUBLIC_THREADFLANK_KEY}
        productSku={product.sku}
        garmentImageUrl={product.highResImage}
        category={product.category}
        onTryOnComplete={(renderResult) => {
          console.log("Photorealistic render completed:", renderResult.imageUrl);
        }}
      />
    </div>
  );
}`,
};

const FAQS = [
  {
    q: "Does the AI try-on preserve my real face, skin tone, and body proportions?",
    a: "Yes, 100%. Unlike legacy apps that slap clothes onto generic 3D cartoon avatars or static mannequins, Threadflank uses the state-of-the-art IDM-VTON diffusion pipeline. It retains your exact facial contours, skin undertones across 28 calibrated melanin shades, real hair, posture, and natural background shadows while realistically conforming the garment to your body geometry.",
  },
  {
    q: "Which e-commerce stores and links work with Threadflank?",
    a: "Threadflank works with virtually any fashion website on the internet, including Myntra, Zara, ASOS, Amazon Fashion, H&M, Nykaa, Mango, Massimo Dutti, Net-a-Porter, Farfetch, and Urbanic. Simply paste the product link into our URL scraper. If a site has anti-bot restrictions, you can paste or upload a product screenshot directly and our neural segmenter extracts the garment in under 2 seconds.",
  },
  {
    q: "What kind of selfie works best for the digital twin?",
    a: "A well-lit, eye-level photo from head to knee (or full-body mirror selfie) wearing fitted clothing gives the highest fidelity results. If you prefer not to upload your own photo, our AI Model Generator lets you create a persistent synthetic twin matching your exact height, weight, ethnicity, and body shape.",
  },
  {
    q: "Is my personal photo and biometric data kept secure and private?",
    a: "Yes. Your photos are encrypted end-to-end and stored securely. We never sell, share, or use your private selfies to train public AI models. You retain 100% ownership and can delete your avatar and closet photos at any time with a single click in your profile settings.",
  },
  {
    q: "Can I try on complete multi-piece outfits, shoes, and makeup together?",
    a: "Absolutely. Threadflank's Drape Studio supports layering across 9 wardrobe categories: Tops, Bottoms, Dresses, Outerwear, Footwear, Bags, Jewellery, Eyewear, and Cosmetics (15+ curated lipstick shades, eyeshadow palettes, and blush intensities). You can assemble a head-to-toe look and save it to your Digital Closet.",
  },
  {
    q: "How does the AI Occasion Planner find outfits and detect wardrobe gaps?",
    a: "When you enter your event details (e.g., Destination Wedding in Udaipur, Black Tie, ₹8,000 budget), our contextual stylist engine scans the items in your Digital Closet to formulate 3 complete outfits. It checks weather, venue dress code, and color harmony. If you're missing a key piece—such as a matching formal clutch or velvet stole—it flags the gap and suggests exact shoppable items within your budget.",
  },
];

export default function LandingPage() {
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState(0);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<"html" | "shopify" | "react">("html");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [urlInput, setUrlInput] = useState("");

  const currentGarment = DEMO_GARMENTS[selectedGarmentIndex];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      window.location.href = `/studio?scrapeUrl=${encodeURIComponent(urlInput.trim())}`;
    } else {
      window.location.href = "/studio";
    }
  };

  return (
    <div className="nf-page">
      {/* ─── 3D Flow Wave Canvas Background ────────────────────────── */}
      <FlowWave />

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="nf-hero" style={{ minHeight: "auto", paddingBottom: 60 }}>
        <div className="nf-hero-glow nf-hero-glow-1" />
        <div className="nf-hero-glow nf-hero-glow-2" />

        {/* Eyebrow Pill */}
        <div className="tf-badge-pill">
          <span className="tf-pulse-dot" />
          Threadflank 2.0 · Neural Virtual Dressing Room &amp; Wardrobe OS
        </div>

        {/* Headline */}
        <h1 className="tf-hero-title">
          Your personal virtual dressing room,<br />
          <span className="tf-gradient-text">engineered by AI.</span>
        </h1>

        {/* Subhead */}
        <p className="tf-hero-lead">
          Upload one selfie or build an AI digital twin. Drape real garments from Myntra, Zara, ASOS, or any store directly onto your body with true fabric physics, zero mannequins, and zero sizing anxiety.
        </p>

        {/* Primary CTAs */}
        <div className="nf-cta-row">
          <Link href="/setup" className="btn-nf-primary" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 12 }}>
            Start Dressing Free
            <span className="nf-kbd">S</span>
          </Link>
          <Link href="/studio" className="btn-nf-ghost" style={{ padding: "14px 26px", fontSize: 15, borderRadius: 12 }}>
            Explore Live Studio
            <span className="nf-kbd nf-kbd-ghost">D</span>
          </Link>
        </div>

        {/* Trust Metric Strip */}
        <div className="tf-hero-metrics">
          <div className="tf-metric-item">
            <span className="tf-metric-val">185,000+</span> Outfits Draped
          </div>
          <span style={{ color: "var(--card-border)" }}>•</span>
          <div className="tf-metric-item">
            <span className="tf-metric-val">38%</span> Return Rate Reduction
          </div>
          <span style={{ color: "var(--card-border)" }}>•</span>
          <div className="tf-metric-item">
            <span className="tf-metric-val">4.9 / 5</span> Stylist Trust Index
          </div>
          <span style={{ color: "var(--card-border)" }}>•</span>
          <div className="tf-metric-item">
            <span className="tf-metric-val">28</span> Skin Tone Calibrations
          </div>
        </div>

        {/* ─── Interactive Hero Drape Sandbox ──────────────────────── */}
        <div className="tf-sandbox-wrap">
          {/* Header Bar */}
          <div className="tf-sandbox-header">
            <div className="tf-window-dots">
              <span className="cp-dot red" />
              <span className="cp-dot yellow" />
              <span className="cp-dot green" />
              <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", marginLeft: 6 }}>
                vton-core-runtime · IDM-VTON Latent Diffusion active
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="tf-preview-tag success" style={{ margin: 0 }}>
                ● GPU Latency: 0.8s
              </span>
              <span style={{ fontSize: 11, color: "var(--text-soft)", fontFamily: "monospace" }}>
                Preservation: 99.4%
              </span>
            </div>
          </div>

          {/* Garment Selector Tabs */}
          <div className="tf-garment-pills">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", paddingRight: 6 }}>
              Select Look:
            </span>
            {DEMO_GARMENTS.map((g, idx) => (
              <button
                key={g.id}
                type="button"
                className={`tf-garment-pill ${selectedGarmentIndex === idx ? "active" : ""}`}
                onClick={() => setSelectedGarmentIndex(idx)}
              >
                <img src={g.thumbImg} alt={g.name} className="tf-garment-pill-thumb" />
                <span>{g.name}</span>
                <span style={{ fontSize: 11, opacity: 0.75, fontFamily: "monospace" }}>({g.brand})</span>
              </button>
            ))}
          </div>

          {/* Sandbox Trio Preview */}
          <div className="tf-sandbox-trio">
            {/* Box 1: Biometric Twin / Selfie */}
            <div className="tf-preview-card">
              <span className="tf-preview-tag">01 · Biometric Selfie</span>
              <div className="tf-preview-img-box">
                <img src="/images/female_avatar.png" alt="User Biometric Model" />
              </div>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Ananya S. (Your Twin)</p>
                <p style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>168 cm · Tone #4 · True Proportions</p>
              </div>
            </div>

            {/* Connector */}
            <div className="tf-connector-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            {/* Box 2: Scraped Garment */}
            <div className="tf-preview-card">
              <span className="tf-preview-tag">02 · Scraped Garment</span>
              <div className="tf-preview-img-box" style={{ background: "rgba(255,255,255,0.03)" }}>
                <img src={currentGarment.garmentImg} alt={currentGarment.name} />
              </div>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{currentGarment.name}</p>
                <p style={{ fontSize: 11, color: "var(--purple)", fontWeight: 600 }}>{currentGarment.brand} · {currentGarment.price}</p>
              </div>
            </div>

            {/* Connector */}
            <div className="tf-connector-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            {/* Box 3: Photorealistic AI Try-On */}
            <div className="tf-preview-card featured">
              <span className="tf-preview-tag success">03 · Photorealistic AI Drape</span>
              <div className="tf-preview-img-box" style={{ height: 260 }}>
                <img src={currentGarment.resultImg} alt="AI Drape Result" style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,201,141,0.9)", color: "#000", fontWeight: 800, fontSize: 10, padding: "3px 8px", borderRadius: 6 }}>
                  {currentGarment.matchScore} FIT MATCH
                </div>
              </div>
              <div style={{ marginTop: 12, textAlign: "center", width: "100%" }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>Rendered on your real body</p>
                <p style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 2 }}>{currentGarment.specNotes}</p>
              </div>
            </div>
          </div>

          {/* Sandbox Telemetry Footer */}
          <div className="tf-sandbox-telemetry">
            <div className="tf-telemetry-item">
              <span style={{ color: "var(--purple)" }}>✓</span>
              <span>Fabric Physics: <strong>{currentGarment.fabric}</strong></span>
            </div>
            <div className="tf-telemetry-item">
              <span style={{ color: "var(--purple)" }}>✓</span>
              <span>Pose &amp; Shadow: <strong>Natural Ambient Occlusion</strong></span>
            </div>
            <div className="tf-telemetry-item">
              <Link href="/studio" style={{ color: "var(--purple)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                Open Studio with this piece →
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Live URL Scraper Search Bar ─────────────────────────── */}
        <form onSubmit={handleUrlSubmit} className="tf-url-search-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <input
            type="text"
            className="tf-url-input"
            placeholder="Paste any garment link from Myntra, Zara, ASOS, Amazon..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="submit" className="tf-url-btn">
            Drape on Me
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </section>

      {/* ─── Frosted Blur Layer (Content Hub) ───────────────────────── */}
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
        <div className="tf-pro-container">

          {/* ─── Universal Store Ecosystem Strip ───────────────────── */}
          <div className="tf-stores-strip">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 8 }}>
              Compatible Stores:
            </span>
            {["Zara", "Myntra", "ASOS", "Amazon Fashion", "H&M", "Nykaa", "Mango", "Massimo Dutti", "Net-a-Porter", "Urbanic"].map((s) => (
              <span key={s} className="tf-store-pill">{s}</span>
            ))}
            <span className="tf-store-pill" style={{ borderColor: "rgba(var(--purple-rgb),0.5)", color: "var(--purple)", background: "rgba(var(--purple-rgb),0.06)" }}>
              + Any Store URL or Screenshot
            </span>
          </div>

          {/* ─── 4-Step Neural Pipeline ────────────────────────────── */}
          <section style={{ padding: "40px 0 70px" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <span className="tf-badge-pill">Autonomous Architecture</span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>
                How Threadflank Transforms <span className="tf-gradient-text">Virtual Shopping</span>
              </h2>
              <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 580, margin: "12px auto 0", lineHeight: 1.65 }}>
                An end-to-end computer vision and latent diffusion pipeline engineered to eliminate sizing friction and returns.
              </p>
            </div>

            <div className="tf-pipeline-grid">
              {/* Step 1 */}
              <div className="tf-pipeline-card">
                <div className="tf-pipeline-step-num">01</div>
                <h3 className="tf-pipeline-title">Biometric Twin Ingestion</h3>
                <p className="tf-pipeline-desc">
                  Upload a single casual photo or generate an exact synthetic twin. Calibrate height, weight, proportions, and select from 28 inclusive melanin skin undertones.
                </p>
                <div className="tf-pipeline-chips">
                  <span className="tf-pipeline-chip">Zero-Calibration</span>
                  <span className="tf-pipeline-chip">Face Lock</span>
                  <span className="tf-pipeline-chip">28 Tones</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="tf-pipeline-card">
                <div className="tf-pipeline-step-num">02</div>
                <h3 className="tf-pipeline-title">Universal URL Scraper</h3>
                <p className="tf-pipeline-desc">
                  Paste any product page link. Our automated parser extracts garment cut, fabric composition, collar structure, and textures without manual cropping.
                </p>
                <div className="tf-pipeline-chips">
                  <span className="tf-pipeline-chip">Cheerio Engine</span>
                  <span className="tf-pipeline-chip">JSON-LD</span>
                  <span className="tf-pipeline-chip">Auto-Cutout</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="tf-pipeline-card">
                <div className="tf-pipeline-step-num">03</div>
                <h3 className="tf-pipeline-title">IDM-VTON Diffusion Draping</h3>
                <p className="tf-pipeline-desc">
                  High-fidelity latent diffusion maps garment physics to your unique body geometry. Folds, stretching, fabric sheen, and ambient lighting blend photorealistically.
                </p>
                <div className="tf-pipeline-chips">
                  <span className="tf-pipeline-chip">Diffusion v2.4</span>
                  <span className="tf-pipeline-chip">Specular Sheen</span>
                  <span className="tf-pipeline-chip">&lt; 90s GPU</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="tf-pipeline-card">
                <div className="tf-pipeline-step-num">04</div>
                <h3 className="tf-pipeline-title">Head-to-Toe Styling &amp; Sync</h3>
                <p className="tf-pipeline-desc">
                  Layer accessories, shoes, and 15+ cosmetics. Match with owned wardrobe items, run event gap detection, and share with friends for real-time second opinions.
                </p>
                <div className="tf-pipeline-chips">
                  <span className="tf-pipeline-chip">9 Slots</span>
                  <span className="tf-pipeline-chip">Gap Detector</span>
                  <span className="tf-pipeline-chip">Cost/Wear</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 4 Feature Spotlight Pillars (Alternating Showcase) ─── */}
          <section className="tf-spotlights">

            {/* Spotlight 1: AI Virtual Dressing Room */}
            <div className="tf-spotlight-row">
              <div className="tf-spotlight-text">
                <span className="tf-spotlight-eyebrow">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple)" }} />
                  Photorealistic Drape Engine
                </span>
                <h3 className="tf-spotlight-title">
                  Drape garments like <br />
                  <span className="tf-gradient-text">they exist in reality</span>
                </h3>
                <p className="tf-spotlight-desc">
                  Never buy the wrong size or unflattering cut again. Threadflank synthesizes natural drape, fabric weight, and body contours so you know precisely how an item hangs before opening your wallet.
                </p>
                <div className="tf-checklist">
                  <div className="tf-check-item">
                    <span className="tf-check-icon">✓</span>
                    <span><strong>100% Identity Preservation:</strong> Keeps your real face, hairstyle, posture, and lighting intact.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon">✓</span>
                    <span><strong>Multi-Layer Styling:</strong> Try tops with outerwear, trousers, shoes, and jewelry simultaneously.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon">✓</span>
                    <span><strong>Integrated Makeup Studio:</strong> Test 15+ lipstick shades, eyeshadow palettes, and blush overlays.</span>
                  </div>
                </div>
                <Link href="/studio" className="btn-nf-primary" style={{ borderRadius: 10, padding: "10px 22px" }}>
                  Open Drape Studio →
                </Link>
              </div>

              <div className="tf-spotlight-media">
                <img src="/images/feature-tryon.jpg" alt="AI Virtual Try-On Studio" className="tf-spotlight-img" />
                <div className="tf-media-badge">
                  <span className="font-mono">Realtime Diffusion · Multi-Layer Layering</span>
                  <span style={{ color: "var(--purple)", fontWeight: 700 }}>99.2% Accuracy</span>
                </div>
              </div>
            </div>

            {/* Spotlight 2: Autonomous AI Occasion Planner */}
            <div className="tf-spotlight-row reverse">
              <div className="tf-spotlight-text">
                <span className="tf-spotlight-eyebrow" style={{ color: "var(--pink)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pink)" }} />
                  Contextual AI Stylist
                </span>
                <h3 className="tf-spotlight-title">
                  Smart Occasion Planner &amp; <br />
                  <span style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Wardrobe Gap Detection
                  </span>
                </h3>
                <p className="tf-spotlight-desc">
                  Have an upcoming wedding, black-tie dinner, or board meeting? Tell Threadflank the event details and budget. It curates complete outfits from garments you already own while pinpointing missing gap pieces.
                </p>
                <div className="tf-checklist">
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(14,165,233,0.15)", color: "var(--pink)" }}>✓</span>
                    <span><strong>Context Intake:</strong> Factors in venue, dress code, local weather, and travel baggage constraints.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(14,165,233,0.15)", color: "var(--pink)" }}>✓</span>
                    <span><strong>Shop Missing Gaps:</strong> Highlights exact missing items (e.g. clutch or heels) with direct buy links.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(14,165,233,0.15)", color: "var(--pink)" }}>✓</span>
                    <span><strong>Confidence Rating:</strong> Every recommended combination is scored for dress code compliance.</span>
                  </div>
                </div>
                <Link href="/outfits" className="btn-nf-primary" style={{ borderRadius: 10, padding: "10px 22px", background: "var(--pink)", borderColor: "rgba(14,165,233,0.4)" }}>
                  Plan Your Next Event →
                </Link>
              </div>

              <div className="tf-spotlight-media">
                <img src="/images/look_office.png" alt="Occasion Planner Showcase" className="tf-spotlight-img" />
                <div className="tf-media-badge">
                  <span className="font-mono">Occasion: Business Boardroom · Formal</span>
                  <span style={{ color: "var(--pink)", fontWeight: 700 }}>Confidence: 96%</span>
                </div>
              </div>
            </div>

            {/* Spotlight 3: Digital Wardrobe OS */}
            <div className="tf-spotlight-row">
              <div className="tf-spotlight-text">
                <span className="tf-spotlight-eyebrow" style={{ color: "#f59e0b" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                  Wardrobe Operating System
                </span>
                <h3 className="tf-spotlight-title">
                  Catalogue your closet. <br />
                  <span style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Track Cost-Per-Wear.
                  </span>
                </h3>
                <p className="tf-spotlight-desc">
                  Digitize your clothes across 9 distinct categories. Create capsule collections, save curated Looks, and unlock automated metrics that reveal what you actually wear versus what gathers dust.
                </p>
                <div className="tf-checklist">
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>✓</span>
                    <span><strong>9 Categories:</strong> Tops, Bottoms, Dresses, Outerwear, Shoes, Bags, Jewelry, Eyewear, Makeup.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>✓</span>
                    <span><strong>Cost-Per-Wear Intelligence:</strong> Track real financial return on your luxury and everyday pieces.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>✓</span>
                    <span><strong>Saved Looks Archive:</strong> Revisit your best outfit formulas anytime with 1-tap re-try.</span>
                  </div>
                </div>
                <Link href="/closet" className="btn-nf-primary" style={{ borderRadius: 10, padding: "10px 22px", background: "#f59e0b", borderColor: "rgba(245,158,11,0.4)" }}>
                  Explore Digital Closet →
                </Link>
              </div>

              <div className="tf-spotlight-media">
                <img src="/images/feature-wardrobe.jpg" alt="Digital Closet Showcase" className="tf-spotlight-img" />
                <div className="tf-media-badge">
                  <span className="font-mono">Closet Sync: 48 Owned Items Active</span>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>Avg CPW: ₹180</span>
                </div>
              </div>
            </div>

            {/* Spotlight 4: Discover Feed & Social Second Opinion */}
            <div className="tf-spotlight-row reverse">
              <div className="tf-spotlight-text">
                <span className="tf-spotlight-eyebrow" style={{ color: "#ec4899" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899" }} />
                  Social Fashion Network
                </span>
                <h3 className="tf-spotlight-title">
                  Editorial Drops &amp; <br />
                  <span style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Instant Second Opinion
                  </span>
                </h3>
                <p className="tf-spotlight-desc">
                  Browse curated brand drops with 1-tap instant try-on. Undecided on a dress? Share outfit cards into private styling rooms or WhatsApp with friends for real-time votes before checking out.
                </p>
                <div className="tf-checklist">
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(236,72,153,0.15)", color: "#ec4899" }}>✓</span>
                    <span><strong>1-Tap "Drape This":</strong> Directly load editorial runway drops onto your digital twin.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(236,72,153,0.15)", color: "#ec4899" }}>✓</span>
                    <span><strong>Real-Time Messaging:</strong> Private styling chat rooms powered by WebSockets.</span>
                  </div>
                  <div className="tf-check-item">
                    <span className="tf-check-icon" style={{ background: "rgba(236,72,153,0.15)", color: "#ec4899" }}>✓</span>
                    <span><strong>Interactive Polls:</strong> Friends can vote "Yes, Buy It" or suggest a matching jacket.</span>
                  </div>
                </div>
                <Link href="/discover" className="btn-nf-primary" style={{ borderRadius: 10, padding: "10px 22px", background: "#ec4899", borderColor: "rgba(236,72,153,0.4)" }}>
                  Browse Discover Feed →
                </Link>
              </div>

              <div className="tf-spotlight-media">
                <img src="/images/feature-discover.jpg" alt="Editorial Discover Feed" className="tf-spotlight-img" />
                <div className="tf-media-badge">
                  <span className="font-mono">Live Drops: Zara, H&amp;M Studio, Mango</span>
                  <span style={{ color: "#ec4899", fontWeight: 700 }}>1-Tap Drape Ready</span>
                </div>
              </div>
            </div>

          </section>

          {/* ─── Enterprise & D2C Storefront Widget Section ────────── */}
          <section className="tf-d2c-box">
            <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle, rgba(var(--purple-rgb),0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div className="tf-d2c-grid">
              <div>
                <span className="tf-badge-pill" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text)" }}>
                  For Fashion Brands &amp; D2C Merchants
                </span>
                <h3 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "var(--text)", lineHeight: 1.2, margin: "14px 0" }}>
                  Embed Threadflank on your storefront with <span className="tf-gradient-text">2 lines of code</span>.
                </h3>
                <p style={{ color: "var(--text-soft)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                  Reverse logistics and sizing returns cost fashion retailers millions. Threadflank's lightweight widget gives your shoppers instant virtual try-on on product pages, slashing returns by over 34% while lifting conversions.
                </p>

                <div className="tf-kpi-row">
                  <div className="tf-kpi-card">
                    <div className="tf-kpi-num">+42%</div>
                    <div className="tf-kpi-label">Cart Conversion Lift</div>
                  </div>
                  <div className="tf-kpi-card">
                    <div className="tf-kpi-num">-34%</div>
                    <div className="tf-kpi-label">Return Rate Reduction</div>
                  </div>
                  <div className="tf-kpi-card">
                    <div className="tf-kpi-num">3.8x</div>
                    <div className="tf-kpi-label">Time-on-Site Lift</div>
                  </div>
                </div>

                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/pricing" className="btn-nf-primary" style={{ borderRadius: 10, padding: "11px 24px" }}>
                    View Merchant Plans
                  </Link>
                  <Link href="/studio" className="btn-nf-ghost" style={{ borderRadius: 10, padding: "11px 22px" }}>
                    Test Widget Sandbox
                  </Link>
                </div>
              </div>

              {/* Code Snippet Window */}
              <div className="tf-code-window">
                <div className="tf-code-header">
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setActiveCodeSnippet("html")}
                      style={{
                        background: activeCodeSnippet === "html" ? "rgba(var(--purple-rgb),0.2)" : "transparent",
                        border: "none",
                        color: activeCodeSnippet === "html" ? "var(--purple)" : "var(--muted)",
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      HTML Embed
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeSnippet("shopify")}
                      style={{
                        background: activeCodeSnippet === "shopify" ? "rgba(var(--purple-rgb),0.2)" : "transparent",
                        border: "none",
                        color: activeCodeSnippet === "shopify" ? "var(--purple)" : "var(--muted)",
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Shopify Liquid
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeSnippet("react")}
                      style={{
                        background: activeCodeSnippet === "react" ? "rgba(var(--purple-rgb),0.2)" : "transparent",
                        border: "none",
                        color: activeCodeSnippet === "react" ? "var(--purple)" : "var(--muted)",
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      React SDK
                    </button>
                  </div>
                  <span>SDK v2.4</span>
                </div>
                <pre className="tf-code-body">
                  <code>{CODE_SNIPPETS[activeCodeSnippet]}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* ─── Executive Comparison Matrix ────────────────────────── */}
          <section style={{ padding: "40px 0 60px" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span className="tf-badge-pill">The Competitive Advantage</span>
              <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: "var(--text)" }}>
                Why Threadflank Is <span className="tf-gradient-text">Leagues Ahead</span>
              </h2>
              <p style={{ color: "var(--text-soft)", fontSize: 15, maxWidth: 540, margin: "10px auto 0" }}>
                A side-by-side comparison with traditional e-commerce and legacy 3D mannequin apps.
              </p>
            </div>

            <div className="tf-matrix-wrap">
              <table className="tf-matrix-table">
                <thead>
                  <tr>
                    <th>Capability &amp; Technology</th>
                    <th className="tf-col-highlight">Threadflank AI VTON</th>
                    <th>Traditional Shopping</th>
                    <th>Legacy 3D Avatar Apps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Facial &amp; Body Realism</strong></td>
                    <td className="tf-col-highlight" style={{ color: "var(--purple)" }}>
                      ✓ 100% Exact Face, Skin Tone &amp; Body Lock
                    </td>
                    <td style={{ color: "var(--muted)" }}>✗ Static model mannequin only</td>
                    <td style={{ color: "var(--muted)" }}>✗ Generic cartoonish 3D meshes</td>
                  </tr>
                  <tr>
                    <td><strong>Store Ingestion &amp; Scraping</strong></td>
                    <td className="tf-col-highlight" style={{ color: "var(--purple)" }}>
                      ✓ Any Store URL (Zara, Myntra, ASOS, etc.)
                    </td>
                    <td style={{ color: "var(--muted)" }}>✗ Fragmented across different apps</td>
                    <td style={{ color: "var(--muted)" }}>✗ Restricted to locked partner catalogs</td>
                  </tr>
                  <tr>
                    <td><strong>Multi-Piece Head-to-Toe Styling</strong></td>
                    <td className="tf-col-highlight" style={{ color: "var(--purple)" }}>
                      ✓ Layer 9 slots: Garments, Shoes, Bags, Makeup
                    </td>
                    <td style={{ color: "var(--muted)" }}>✗ Separate product tabs</td>
                    <td style={{ color: "var(--muted)" }}>✗ Single garment swap only</td>
                  </tr>
                  <tr>
                    <td><strong>Event &amp; Wardrobe Gap Detection</strong></td>
                    <td className="tf-col-highlight" style={{ color: "var(--purple)" }}>
                      ✓ Auto-matches owned closet + flags missing pieces
                    </td>
                    <td style={{ color: "var(--muted)" }}>✗ None (manual guesswork)</td>
                    <td style={{ color: "var(--muted)" }}>✗ None</td>
                  </tr>
                  <tr>
                    <td><strong>Social Feedback &amp; Polls</strong></td>
                    <td className="tf-col-highlight" style={{ color: "var(--purple)" }}>
                      ✓ Real-time styling chat &amp; WhatsApp cards
                    </td>
                    <td style={{ color: "var(--muted)" }}>✗ Manual screenshots in WhatsApp</td>
                    <td style={{ color: "var(--muted)" }}>✗ Static image downloads only</td>
                  </tr>
                  <tr>
                    <td><strong>Privacy &amp; Biometric Security</strong></td>
                    <td className="tf-col-highlight" style={{ color: "var(--purple)" }}>
                      ✓ End-to-end encrypted; 1-click photo deletion
                    </td>
                    <td style={{ color: "var(--muted)" }}>— N/A</td>
                    <td style={{ color: "var(--muted)" }}>✗ Often shared to third parties</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Stylist & User Testimonials ────────────────────────── */}
          <section style={{ padding: "40px 0 60px" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span className="tf-badge-pill">Verified Reviews</span>
              <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: "var(--text)" }}>
                Trusted by <span className="tf-gradient-text">Over 80,000 Fashion Lovers</span>
              </h2>
            </div>

            <div className="tf-testimonials-grid">
              {/* Review 1 */}
              <div className="tf-test-card">
                <div className="tf-test-stars">★★★★★</div>
                <p className="tf-test-quote">
                  "Threadflank completely cured my shopping return fatigue. I used to order 3 sizes of every Zara dress and return 2. Now I drape it on my AI twin first, check the fabric flow, and buy once with absolute confidence."
                </p>
                <div className="tf-test-author">
                  <img src="/images/female_avatar.png" alt="Rhea K." className="tf-test-avatar" />
                  <div className="tf-test-info">
                    <span className="tf-test-name">Rhea Kapoor</span>
                    <span className="tf-test-role">Product Lead · Bengaluru</span>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(var(--purple-rgb),0.1)", color: "var(--purple)", fontWeight: 600 }}>
                    Verified Buyer
                  </span>
                </div>
              </div>

              {/* Review 2 */}
              <div className="tf-test-card">
                <div className="tf-test-stars">★★★★★</div>
                <p className="tf-test-quote">
                  "The Occasion Planner saved me ₹14,000 for an Udaipur wedding. It combined a lehenga skirt I already owned with a new silk top from Myntra and even alerted me that I needed emerald earrings to complete the palette."
                </p>
                <div className="tf-test-author">
                  <img src="/images/female_avatar.png" alt="Pooja M." className="tf-test-avatar" />
                  <div className="tf-test-info">
                    <span className="tf-test-name">Pooja Mathur</span>
                    <span className="tf-test-role">Bridal Consultant · Mumbai</span>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(var(--purple-rgb),0.1)", color: "var(--purple)", fontWeight: 600 }}>
                    Verified Stylist
                  </span>
                </div>
              </div>

              {/* Review 3 */}
              <div className="tf-test-card">
                <div className="tf-test-stars">★★★★★</div>
                <p className="tf-test-quote">
                  "As someone working in fashion editorial, this is the first AI draping engine that actually respects fabric physics. The way silk shines and tailored wool drapes over shoulders without distortion is genuinely mind-blowing."
                </p>
                <div className="tf-test-author">
                  <img src="/images/male_avatar.png" alt="Karan V." className="tf-test-avatar" />
                  <div className="tf-test-info">
                    <span className="tf-test-name">Karan Verma</span>
                    <span className="tf-test-role">Fashion Editor · New Delhi</span>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(var(--purple-rgb),0.1)", color: "var(--purple)", fontWeight: 600 }}>
                    Verified VIP
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Interactive FAQ Section ───────────────────────────── */}
          <section style={{ padding: "40px 0 60px" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span className="tf-badge-pill">Common Inquiries</span>
              <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: "var(--text)" }}>
                Frequently Asked <span className="tf-gradient-text">Questions</span>
              </h2>
            </div>

            <div className="tf-faq-wrap">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className={`tf-faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      type="button"
                      className="tf-faq-question"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="tf-faq-chevron"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="tf-faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── High Conversion Pre-Footer Banner ──────────────────── */}
          <div className="tf-cta-banner">
            <span className="tf-badge-pill" style={{ background: "rgba(var(--purple-rgb),0.12)" }}>
              Experience the Future of Dressing
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4.2vw, 46px)", fontWeight: 800, color: "var(--text)", lineHeight: 1.2, margin: "18px 0" }}>
              Ready to see yourself in <br />
              <span className="tf-gradient-text">every outfit you've ever wanted?</span>
            </h2>
            <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Join over 80,000 smart shoppers dressing with certainty. Upload your selfie in 30 seconds and start draping from any store link right now.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/setup" className="btn-nf-primary" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}>
                Create My Digital Twin Free
              </Link>
              <Link href="/studio" className="btn-nf-ghost" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 12 }}>
                Try Demo Studio
              </Link>
            </div>
          </div>

          {/* ─── Stats Bar ─────────────────────────────────────────── */}
          <section className="nf-stats-bar" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", margin: "40px 0" }}>
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

          {/* ─── Comprehensive Footer ──────────────────────────────── */}
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
                  <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 280, marginTop: 8 }}>
                    Next-generation AI virtual dressing room, personal wardrobe operating system, and fashion collaboration network.
                  </p>
                </div>

                <div className="nf-footer-cols">
                  <div className="nf-footer-col">
                    <div className="nf-footer-col-title">Studio</div>
                    <Link href="/studio" className="nf-footer-link">AI Drape Studio</Link>
                    <Link href="/setup" className="nf-footer-link">Digital Twin Setup</Link>
                    <Link href="/outfits" className="nf-footer-link">Occasion Planner</Link>
                    <Link href="/closet" className="nf-footer-link">Digital Closet</Link>
                    <Link href="/discover" className="nf-footer-link">Discover Drops</Link>
                  </div>
                  <div className="nf-footer-col">
                    <div className="nf-footer-col-title">Features</div>
                    <Link href="/studio" className="nf-footer-link">IDM-VTON Engine</Link>
                    <Link href="/studio" className="nf-footer-link">Cosmetics &amp; Lip Studio</Link>
                    <Link href="/closet" className="nf-footer-link">Cost-Per-Wear Calc</Link>
                    <Link href="/messages" className="nf-footer-link">Real-time Styling Chat</Link>
                    <Link href="/pricing" className="nf-footer-link">D2C Storefront Widget</Link>
                  </div>
                  <div className="nf-footer-col">
                    <div className="nf-footer-col-title">Stores</div>
                    {["Myntra", "Zara", "ASOS", "Amazon Fashion", "H&M", "Nykaa"].map((s) => (
                      <span key={s} className="nf-footer-link">{s}</span>
                    ))}
                  </div>
                  <div className="nf-footer-col">
                    <div className="nf-footer-col-title">Company</div>
                    <Link href="/pricing" className="nf-footer-link">Plans &amp; Pricing</Link>
                    <span className="nf-footer-link">Security &amp; Biometrics</span>
                    <span className="nf-footer-link">Brand Partnerships</span>
                    <span className="nf-footer-link">Privacy Policy</span>
                    <span className="nf-footer-link">Terms of Service</span>
                  </div>
                </div>
              </div>

              <div className="nf-footer-bottom">
                <div className="nf-footer-status">
                  <span className="status-dot status-dot-green" />
                  All neural inference pipelines operational
                </div>
                <div className="nf-footer-copy">© 2026 Threadflank Technologies Inc. All rights reserved.</div>
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
    </div>
  );
}
