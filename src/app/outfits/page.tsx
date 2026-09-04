"use client";
import { useState } from "react";
import Link from "next/link";

type EventType = "wedding" | "work" | "party" | "date" | "casual" | "formal" | "travel";
type DressCode = "smart-casual" | "formal" | "black-tie" | "casual" | "business";

const EVENT_TYPES: { id: EventType; label: string; icon: React.ReactNode }[] = [
  { id: "wedding", label: "Wedding", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
  { id: "work",    label: "Work / Meeting", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> },
  { id: "party",   label: "Party / Night Out", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l-6 9z"/><line x1="12" y1="12" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg> },
  { id: "date",    label: "Date Night", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg> },
  { id: "casual",  label: "Casual Outing", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: "formal",  label: "Formal / Gala", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { id: "travel",  label: "Travel", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg> },
];

const DRESS_CODES: { id: DressCode; label: string }[] = [
  { id: "casual",       label: "Casual" },
  { id: "smart-casual", label: "Smart Casual" },
  { id: "business",     label: "Business" },
  { id: "formal",       label: "Formal" },
  { id: "black-tie",    label: "Black Tie" },
];

// Mock AI outfit suggestions (replace with real API when ready)
const MOCK_SUGGESTIONS = [
  {
    id: "s1",
    name: "Elevated Classic",
    confidence: 94,
    pieces: [
      { name: "White Oxford Shirt", category: "tops", color: "#f8f8f0" },
      { name: "Black Tailored Trousers", category: "bottoms", color: "#1a1a2e" },
      { name: "Camel Blazer", category: "outerwear", color: "#c8a96e" },
      { name: "White Leather Sneakers", category: "footwear", color: "#f5f5f5" },
    ],
    note: "A timeless combination that works across most occasions. The camel blazer elevates the casual base.",
    missing: [],
  },
  {
    id: "s2",
    name: "Minimalist Chic",
    confidence: 88,
    pieces: [
      { name: "Black Fitted Dress", category: "dresses", color: "#0d0d0d" },
      { name: "Strappy Heels", category: "footwear", color: "#8b6f47" },
      { name: "Pearl Necklace", category: "jewellery", color: "#f5f0e8" },
    ],
    note: "A sleek monochrome look. Add a clutch bag to complete the ensemble.",
    missing: [{ name: "Clutch Bag", category: "bags" }],
  },
  {
    id: "s3",
    name: "Smart Casual Power",
    confidence: 82,
    pieces: [
      { name: "Navy Polo Shirt", category: "tops", color: "#1a3a5c" },
      { name: "Chino Trousers", category: "bottoms", color: "#c2a87d" },
      { name: "Leather Loafers", category: "footwear", color: "#6b3a2a" },
      { name: "Minimalist Watch", category: "jewellery", color: "#c0c0c0" },
    ],
    note: "Smart but approachable. Works for daytime business meetings or upscale casual events.",
    missing: [],
  },
];

export default function OutfitsPage() {
  const [step, setStep] = useState<"input" | "results">("input");
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [dressCode, setDressCode] = useState<DressCode | null>(null);
  const [occasion, setOccasion] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedLooks, setSavedLooks] = useState<Set<string>>(new Set());

  const canSubmit = eventType && occasion.trim();

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    // Simulate API call delay — replace with real API call
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setStep("results");
  };

  const toggleSave = (id: string) => {
    setSavedLooks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 24, maxWidth: 760, margin: "0 auto" }}>

      {step === "input" && (
        <>
          {/* ── Header ── */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M9 16l2 2 4-4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Occasion Planner</h1>
            <p style={{ color: "var(--text-soft)", fontSize: 14 }}>Tell us about your event — we'll pick the best outfits from your closet.</p>
          </div>

          {/* ── Form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Event Type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 10 }}>What's the occasion?</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {EVENT_TYPES.map(et => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setEventType(et.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--r-md)",
                      border: `1px solid ${eventType === et.id ? "var(--accent)" : "var(--border)"}`,
                      background: eventType === et.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--surface)",
                      color: eventType === et.id ? "var(--accent)" : "var(--text-soft)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: eventType === et.id ? 600 : 400,
                      transition: "all 0.15s ease",
                      textAlign: "left",
                    }}
                  >
                    {et.icon}{et.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Describe it briefly</label>
              <input
                className="form-input"
                placeholder="e.g. Colleague's wedding in Jaipur, rooftop party, work presentation..."
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
              />
            </div>

            {/* Date & Location row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location / Weather</label>
                <input className="form-input" placeholder="e.g. Mumbai, indoors, 34°C" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>

            {/* Dress Code */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 10 }}>Dress code</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DRESS_CODES.map(dc => (
                  <button
                    key={dc.id}
                    type="button"
                    onClick={() => setDressCode(dc.id)}
                    className={`filter-chip${dressCode === dc.id ? " active" : ""}`}
                  >
                    {dc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Budget for missing items (optional)</label>
              <input className="form-input" placeholder="e.g. ₹3,000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Anything else to consider?</label>
              <textarea
                className="form-input"
                placeholder="e.g. I'm the groom's sister, prefer not to wear red, it's an outdoor event..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              className="btn btn-gradient"
              onClick={handleGenerate}
              disabled={!canSubmit || loading}
              style={{ padding: "14px", fontSize: 15, fontWeight: 600 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/><path d="M21 12c0-4.97-4.03-9-9-9"/>
                  </svg>
                  Finding outfits from your closet...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Generate Outfit Suggestions
                </span>
              )}
            </button>
          </div>
        </>
      )}

      {/* ═══════════════════ RESULTS ═══════════════════ */}
      {step === "results" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => setStep("input")}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-soft)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Edit Details
            </button>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{occasion}</p>
              <p style={{ fontSize: 12, color: "var(--text-soft)" }}>{eventType} {dressCode ? `· ${dressCode}` : ""} {location ? `· ${location}` : ""}</p>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 20 }}>
            Found <strong style={{ color: "var(--text)" }}>{MOCK_SUGGESTIONS.length} outfit combinations</strong> from your closet, ranked by fit for this occasion.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MOCK_SUGGESTIONS.map((s, idx) => (
              <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                {/* Card Header */}
                <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "color-mix(in srgb, var(--accent) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                      {idx + 1}
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{s.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <div style={{ height: 4, width: 60, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${s.confidence}%`, background: "var(--accent)", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-soft)" }}>{s.confidence}% match</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(s.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: savedLooks.has(s.id) ? "var(--accent)" : "var(--text-soft)", fontWeight: savedLooks.has(s.id) ? 600 : 400 }}
                  >
                    {savedLooks.has(s.id)
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    }
                    {savedLooks.has(s.id) ? "Saved" : "Save Look"}
                  </button>
                </div>

                {/* Pieces */}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {s.pieces.map((piece, pi) => (
                      <div key={pi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "var(--bg)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: piece.color, border: "1px solid var(--border)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{piece.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-soft)" }}>{piece.category}</span>
                      </div>
                    ))}
                  </div>

                  {s.missing.length > 0 && (
                    <div style={{ marginBottom: 14, padding: "10px 14px", background: "color-mix(in srgb, #f59e0b 8%, transparent)", borderRadius: "var(--r-sm)", border: "1px solid color-mix(in srgb, #f59e0b 25%, transparent)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5 }}>
                        Missing from closet: <strong style={{ color: "var(--text)" }}>{s.missing.map(m => m.name).join(", ")}</strong>
                        {budget && <> — within {budget} budget</>}
                      </p>
                    </div>
                  )}

                  <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, marginBottom: 14 }}>{s.note}</p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/studio" className="btn btn-gradient btn-sm" style={{ flex: 1, textAlign: "center", justifyContent: "center" }}>
                      Try On in Drape
                    </Link>
                    <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => toggleSave(s.id)}>
                      {savedLooks.has(s.id) ? "Saved to Closet" : "Save to Closet"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep("input")}>
              Plan a different occasion
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
