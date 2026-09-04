"use client";

import { useState } from "react";
import Link from "next/link";

type Audience = "shoppers" | "brands";
type BillingCycle = "monthly" | "yearly";

export default function PricingPage() {
  const [audience, setAudience] = useState<Audience>("shoppers");
  const [billing, setBilling] = useState<BillingCycle>("yearly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const isYearly = billing === "yearly";

  const shopperPlans = [
    {
      name: "Free Starter",
      tagline: "Explore virtual try-on and manage your everyday essentials.",
      priceMonthly: "₹0",
      priceYearly: "₹0",
      period: "forever free",
      popular: false,
      ctaText: "Start for Free",
      ctaHref: "/signup",
      features: [
        "5 AI try-on renders per month",
        "Standard HD rendering resolution",
        "Digital Closet (up to 20 garments)",
        "Curated brand drops & Discover feed",
        "Public store link scraper (Myntra & Zara)",
        "Basic occasion tags",
      ],
      missing: [
        "Persistent AI body & skin twin",
        "Unlimited occasion outfit generator",
        "Makeup & cosmetic simulation",
        "Priority GPU rendering queue",
      ],
    },
    {
      name: "Pro Stylist",
      tagline: "For fashion lovers who want flawless fit, daily confidence, and smart outfit planning.",
      priceMonthly: "₹399",
      priceYearly: "₹299",
      period: isYearly ? "per month, billed annually (₹3,588/yr)" : "per month",
      popular: true,
      badge: "Most Popular",
      ctaText: "Get Pro Access",
      ctaHref: "/signup?plan=pro",
      features: [
        "Unlimited AI Try-On & Drape renders",
        "Persistent AI Body Twin (consistent body & skin tone)",
        "Occasion Planner AI with Wardrobe Gap analysis",
        "Unlimited Digital Closet items & Saved Looks",
        "Ultra-HD 4K photorealistic garment drape simulation",
        "Full Virtual Makeup Studio (lipsticks, eyeshadow, blush)",
        "Jewellery, eyewear & accessory styling layer",
        "Priority GPU rendering queue (<15s speed)",
        "In-app collaborative feedback with friends",
      ],
      missing: [],
    },
    {
      name: "Lifetime VIP",
      tagline: "One-time investment for permanent access to all future AI fashion models.",
      priceMonthly: "₹3,999",
      priceYearly: "₹3,999",
      period: "one-time payment, lifetime access",
      popular: false,
      badge: "Best Value",
      ctaText: "Claim Lifetime VIP",
      ctaHref: "/signup?plan=vip",
      features: [
        "Everything in Pro Stylist, forever",
        "No monthly or recurring renewal fees",
        "Early access to next-gen AI garment physics models",
        "Direct input into new feature roadmaps",
        "Dedicated VIP priority support channel",
        "Founding member profile badge",
      ],
      missing: [],
    },
  ];

  const brandPlans = [
    {
      name: "D2C Starter Widget",
      tagline: "Ideal for growing fashion brands wanting to reduce returns and boost conversions.",
      priceMonthly: "₹4,999",
      priceYearly: "₹3,999",
      period: isYearly ? "per month, billed annually" : "per month",
      popular: false,
      ctaText: "Start 14-Day Free Trial",
      ctaHref: "/signup?type=brand&plan=starter",
      features: [
        "Embeddable 1-line JavaScript / Shopify widget",
        "Up to 1,000 try-on sessions / month",
        "Catalog auto-sync (up to 250 active SKUs)",
        "Mobile responsive overlay on product detail pages",
        "Core conversion & click-through analytics",
        "Expected return rate reduction: 18–25%",
        "Email & ticket support with 24h SLA",
      ],
      missing: [
        "Custom brand white-labeling",
        "Shopify Plus webhook integration",
        "Custom fabric physics fine-tuning",
      ],
    },
    {
      name: "Growth Brand",
      tagline: "For established D2C labels looking for high-volume virtual try-on with branded styling.",
      priceMonthly: "₹14,999",
      priceYearly: "₹11,999",
      period: isYearly ? "per month, billed annually" : "per month",
      popular: true,
      badge: "Recommended for D2C",
      ctaText: "Launch Growth Widget",
      ctaHref: "/signup?type=brand&plan=growth",
      features: [
        "Up to 5,000 try-on sessions / month",
        "Catalog sync up to 1,500 active SKUs",
        "Full custom branding (remove Threadflank badge)",
        "Shopify Plus & WooCommerce headless integration",
        "Advanced sizing & fit return analytics dashboard",
        "Webhook API access for custom customer journeys",
        "Dedicated Customer Success Manager",
        "Monthly ROI & conversion audit report",
      ],
      missing: [
        "Private dedicated GPU cluster",
        "Custom native mobile app SDK",
      ],
    },
    {
      name: "Enterprise Flagship",
      tagline: "Tailored infrastructure for luxury fashion houses, omnichannel retail, and global marketplaces.",
      priceMonthly: "Custom",
      priceYearly: "Custom",
      period: "starts from ₹49,999 / month",
      popular: false,
      badge: "Custom Architecture",
      ctaText: "Schedule Architecture Call",
      ctaHref: "mailto:enterprise@threadflank.com?subject=Threadflank%20Enterprise%20Inquiry",
      features: [
        "Unlimited try-on sessions & catalog size",
        "Custom AI model fine-tuning on brand fabric textures & drape",
        "Dedicated private GPU cluster with guaranteed <10s latency",
        "Full White-Label Native SDK (iOS, Android, React Native)",
        "In-store digital smart mirror integration support",
        "Enterprise single sign-on (SSO) & role-based permissions",
        "99.95% uptime SLA with 24/7 engineering hotline",
      ],
      missing: [],
    },
  ];

  const faqs = [
    {
      q: "How does the AI Try-On work on customer photos?",
      a: "Threadflank uses an advanced diffusion-based virtual try-on pipeline (IDM-VTON). Users upload a selfie or body photo once, and the AI accurately replaces the garment while completely preserving their original face, hair, body geometry, posture, and lighting conditions.",
    },
    {
      q: "How do brands integrate the widget into Shopify or custom websites?",
      a: "Integration takes less than 5 minutes. You paste a single script tag into your theme or install the Threadflank Shopify App. The widget automatically detects product photos, binds to the 'Try On' button, and syncs sizing effortlessly.",
    },
    {
      q: "Can I cancel or switch my personal plan anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account settings. If you cancel, your paid perks remain active until the end of the billing period.",
    },
    {
      q: "How does Threadflank help reduce e-commerce return rates?",
      a: "In India, fashion e-commerce returns average 30–40%, primarily driven by sizing ambiguity and buyer hesitation. When shoppers see how fabric drapes on their actual body type, purchase intent rises by 34% and return rates decrease by 22–28%.",
    },
    {
      q: "Is customer and body measurement data kept private?",
      a: "Yes, customer privacy is paramount. User photos and biometric data are encrypted in transit and at rest. We never sell user images or share personal photos with third parties.",
    },
  ];

  return (
    <div className="page-wrapper" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 1200, margin: "0 auto" }}>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          borderRadius: 99,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-soft)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 16
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
          Simple &amp; Transparent Plans
        </div>

        <h1 style={{ fontSize: "clamp(30px, 4.5vw, 44px)", fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: 14 }}>
          Invest in <span style={{ background: "linear-gradient(135deg, #00c98d, #0ea5e9, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>confidence &amp; scale</span>
        </h1>

        <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          Choose the plan that fits your personal styling needs or powers your fashion label's digital dressing room.
        </p>
      </div>

      {/* ─── Audience Selector (Shoppers vs Brands) ──────────────── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{
          display: "inline-flex",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 4,
          gap: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}>
          <button
            type="button"
            onClick={() => setAudience("shoppers")}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              fontSize: 14,
              fontWeight: audience === "shoppers" ? 700 : 500,
              background: audience === "shoppers" ? "var(--accent)" : "transparent",
              color: audience === "shoppers" ? "#ffffff" : "var(--text-soft)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            For Shoppers (Personal)
          </button>

          <button
            type="button"
            onClick={() => setAudience("brands")}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              fontSize: 14,
              fontWeight: audience === "brands" ? 700 : 500,
              background: audience === "brands" ? "var(--accent)" : "transparent",
              color: audience === "brands" ? "#ffffff" : "var(--text-soft)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            For Brands &amp; Retailers (B2B)
          </button>
        </div>
      </div>

      {/* ─── Billing Cycle Toggle (Monthly vs Yearly) ────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 44 }}>
        <span style={{ fontSize: 14, color: !isYearly ? "var(--text)" : "var(--text-soft)", fontWeight: !isYearly ? 600 : 400 }}>Monthly</span>
        <button
          type="button"
          onClick={() => setBilling(isYearly ? "monthly" : "yearly")}
          style={{
            width: 48,
            height: 26,
            borderRadius: 99,
            background: isYearly ? "var(--accent)" : "var(--border)",
            border: "none",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s ease",
            padding: 2
          }}
          aria-label="Toggle annual billing"
        >
          <div style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#ffffff",
            transform: isYearly ? "translateX(22px)" : "translateX(0px)",
            transition: "transform 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }} />
        </button>
        <span style={{ fontSize: 14, color: isYearly ? "var(--text)" : "var(--text-soft)", fontWeight: isYearly ? 600 : 400 }}>
          Yearly
        </span>
        <span style={{
          padding: "3px 9px",
          borderRadius: 99,
          background: "rgba(0, 201, 141, 0.12)",
          border: "1px solid rgba(0, 201, 141, 0.3)",
          color: "#00c98d",
          fontSize: 11,
          fontWeight: 700
        }}>
          Save 25%
        </span>
      </div>

      {/* ─── Pricing Cards Grid ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 70 }}>
        {(audience === "shoppers" ? shopperPlans : brandPlans).map((plan, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--surface)",
              border: plan.popular ? "2px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: 22,
              padding: "34px 28px 30px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              boxShadow: plan.popular ? "0 12px 40px rgba(0, 201, 141, 0.12)" : "0 8px 30px rgba(0,0,0,0.04)",
              transition: "transform 0.2s ease"
            }}
          >
            {/* Top Glow on popular */}
            {plan.popular && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: "linear-gradient(90deg, #00c98d, #0ea5e9, #8b5cf6)"
              }} />
            )}

            {/* Badge */}
            {plan.badge && (
              <div style={{
                display: "inline-block",
                alignSelf: "flex-start",
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(0, 201, 141, 0.12)",
                border: "1px solid rgba(0, 201, 141, 0.3)",
                color: "#00c98d",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 14
              }}>
                {plan.badge}
              </div>
            )}

            <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              {plan.name}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5, minHeight: 40, marginBottom: 20 }}>
              {plan.tagline}
            </p>

            {/* Price Row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 38, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                {isYearly ? plan.priceYearly : plan.priceMonthly}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-soft)" }}>
                {plan.period}
              </span>
            </div>

            {/* CTA Button */}
            <Link
              href={plan.ctaHref}
              className={plan.popular ? "btn btn-gradient" : "btn btn-ghost"}
              style={{
                width: "100%",
                padding: "13px",
                fontSize: 14,
                fontWeight: 700,
                justifyContent: "center",
                marginTop: 14,
                marginBottom: 28,
                textDecoration: "none"
              }}
            >
              {plan.ctaText}
            </Link>

            {/* Feature Checklist */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                Included Features:
              </p>
              {plan.features.map((feat, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-soft)", lineHeight: 1.45 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00c98d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{feat}</span>
                </div>
              ))}

              {plan.missing && plan.missing.map((miss, mi) => (
                <div key={mi} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--muted)", opacity: 0.6, lineHeight: 1.45 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span style={{ textDecoration: "line-through" }}>{miss}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Business Metric Banner ──────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: "36px 32px",
        marginBottom: 70,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 28,
        textAlign: "center"
      }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>34%</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Higher Add-To-Cart Rate</div>
          <p style={{ fontSize: 12, color: "var(--text-soft)" }}>Shoppers who try outfits digitally are 2.4x more likely to complete checkout.</p>
        </div>
        <div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#0ea5e9", marginBottom: 4 }}>-28%</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Lower Fashion Returns</div>
          <p style={{ fontSize: 12, color: "var(--text-soft)" }}>Solves size and fit ambiguity before shipping, saving high courier return costs.</p>
        </div>
        <div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#8b5cf6", marginBottom: 4 }}>&lt; 15s</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Ultra-Fast Render Speed</div>
          <p style={{ fontSize: 12, color: "var(--text-soft)" }}>Engineered for instant gratification on mobile and desktop web.</p>
        </div>
      </div>

      {/* ─── FAQ Section ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: 14, color: "var(--text-soft)" }}>Everything you need to know about our personal and commercial pricing.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                overflow: "hidden"
              }}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: "left",
                  cursor: "pointer",
                  gap: 16
                }}
              >
                <span>{faq.q}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: expandedFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedFaq === idx && (
                <div style={{ padding: "0 22px 18px", color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
