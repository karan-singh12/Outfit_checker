"use client";

import React, { useState, useEffect } from "react";

export interface SkinProfile {
  id: string;
  name: string;
  shadeCode: string; // e.g. "NC30"
  hex: string;
  undertone: "olive" | "golden" | "neutral" | "cool";
  description: string;
  bestColors: { name: string; hex: string }[];
  avoidColors: { name: string; hex: string }[];
  diffusionPrompt: string;
}

export const SOUTH_ASIAN_SKIN_PROFILES: SkinProfile[] = [
  {
    id: "fair-ivory",
    name: "Fair Ivory",
    shadeCode: "NC15–NC20",
    hex: "#f3ccb0",
    undertone: "neutral",
    description: "Fair complexion with delicate peach and subtle neutral undertones.",
    bestColors: [
      { name: "Royal Emerald", hex: "#046307" },
      { name: "Midnight Navy", hex: "#1e3a8a" },
      { name: "Ruby Crimson", hex: "#991b1b" },
      { name: "Plum Violet", hex: "#6b21a8" },
    ],
    avoidColors: [
      { name: "Washed Sand", hex: "#e5e5d8" },
      { name: "Pale Beige", hex: "#f5f5dc" },
    ],
    diffusionPrompt: "authentic South Asian fair skin tone, natural peach neutral undertones, high-fidelity soft studio lighting",
  },
  {
    id: "golden-wheatish",
    name: "Golden Wheatish",
    shadeCode: "NC25–NC30",
    hex: "#e2af88",
    undertone: "olive",
    description: "Classic South Asian wheatish tone with subtle warm olive undertones.",
    bestColors: [
      { name: "Mustard Gold", hex: "#d97706" },
      { name: "Teal Green", hex: "#0f766e" },
      { name: "Rust Terracotta", hex: "#c2410c" },
      { name: "Ivory Silk", hex: "#fef3c7" },
    ],
    avoidColors: [
      { name: "Chalky White", hex: "#f8fafc" },
      { name: "Dusty Grey", hex: "#64748b" },
    ],
    diffusionPrompt: "accurate Indian wheatish skin tone, warm olive undertone, rich natural melanin balance, no whitewashing, warm studio illumination",
  },
  {
    id: "warm-almond",
    name: "Warm Almond",
    shadeCode: "NC35–NC40",
    hex: "#c38c62",
    undertone: "golden",
    description: "Medium South Asian tone radiating rich golden honey warmth.",
    bestColors: [
      { name: "Deep Cobalt", hex: "#1d4ed8" },
      { name: "Marigold Yellow", hex: "#f59e0b" },
      { name: "Sage Olive", hex: "#4d7c0f" },
      { name: "Burnt Orange", hex: "#ea580c" },
    ],
    avoidColors: [
      { name: "Cool Mud Brown", hex: "#574032" },
      { name: "Ashen Lilac", hex: "#c4b5fd" },
    ],
    diffusionPrompt: "warm almond South Asian skin, radiant golden honey undertone, photorealistic natural lighting, authentic skin texture",
  },
  {
    id: "deep-caramel",
    name: "Deep Caramel",
    shadeCode: "NC42–NC45",
    hex: "#a1683e",
    undertone: "golden",
    description: "Rich caramel bronze complexion with deep golden-bronze highlights.",
    bestColors: [
      { name: "Emerald Jewel", hex: "#065f46" },
      { name: "Hot Coral", hex: "#f43f5e" },
      { name: "Warm Amber", hex: "#b45309" },
      { name: "Bright White", hex: "#ffffff" },
    ],
    avoidColors: [
      { name: "Dull Olive", hex: "#3f4a3c" },
      { name: "Faded Khaki", hex: "#78716c" },
    ],
    diffusionPrompt: "rich Indian deep caramel skin, warm bronze undertone, vibrant melanin preservation, authentic portrait lighting, no ashy desaturation",
  },
  {
    id: "rich-umber",
    name: "Rich Umber",
    shadeCode: "NC48–NC52",
    hex: "#764326",
    undertone: "olive",
    description: "Deep espresso complexion with warm earthy undertones and natural glow.",
    bestColors: [
      { name: "Canary Yellow", hex: "#eab308" },
      { name: "Royal Fuchsia", hex: "#c026d3" },
      { name: "Electric Blue", hex: "#2563eb" },
      { name: "Crimson Red", hex: "#dc2626" },
    ],
    avoidColors: [
      { name: "Dark Charcoal", hex: "#1f2937" },
      { name: "Drab Brown", hex: "#451a03" },
    ],
    diffusionPrompt: "deep South Asian rich umber skin, warm espresso undertone, natural dewy glow, sharp realistic skin pigmentation",
  },
  {
    id: "royal-cocoa",
    name: "Royal Cocoa",
    shadeCode: "NC55+",
    hex: "#442314",
    undertone: "cool",
    description: "Luxurious deep cocoa tone that looks breathtaking in high-saturation jewel tones.",
    bestColors: [
      { name: "Pure White", hex: "#ffffff" },
      { name: "Bright Gold", hex: "#fbbf24" },
      { name: "Vibrant Cyan", hex: "#06b6d4" },
      { name: "Neon Lime", hex: "#84cc16" },
    ],
    avoidColors: [
      { name: "Dark Navy", hex: "#0f172a" },
      { name: "Espresso Brown", hex: "#29150d" },
    ],
    diffusionPrompt: "royal cocoa South Asian complexion, rich melanin tones, high contrast studio lighting, realistic skin specular highlights",
  },
];

interface SkinToneSelectorProps {
  selectedId?: string;
  onSelect?: (profile: SkinProfile) => void;
  compact?: boolean;
}

export default function SkinToneSelector({
  selectedId = "golden-wheatish",
  onSelect,
  compact = false,
}: SkinToneSelectorProps) {
  const [activeId, setActiveId] = useState(selectedId);
  const [selectedUndertone, setSelectedUndertone] = useState<"all" | "olive" | "golden" | "neutral" | "cool">("all");

  useEffect(() => {
    if (selectedId) setActiveId(selectedId);
  }, [selectedId]);

  const activeProfile = SOUTH_ASIAN_SKIN_PROFILES.find((p) => p.id === activeId) || SOUTH_ASIAN_SKIN_PROFILES[1];

  const handleSelect = (profile: SkinProfile) => {
    setActiveId(profile.id);
    onSelect?.(profile);
  };

  const filteredProfiles = selectedUndertone === "all"
    ? SOUTH_ASIAN_SKIN_PROFILES
    : SOUTH_ASIAN_SKIN_PROFILES.filter((p) => p.undertone === selectedUndertone);

  return (
    <div className="skin-tone-engine-wrap" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header & Badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              Indian Skin Tone Accuracy Engine
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: "linear-gradient(135deg, rgba(0, 201, 141, 0.2), rgba(14, 165, 233, 0.2))",
                border: "1px solid rgba(0, 201, 141, 0.35)",
                color: "#00c98d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              NC15–NC60+
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-soft)", margin: "2px 0 0" }}>
            Calibrated for South Asian melanin undertones to eliminate whitewashing in try-ons.
          </p>
        </div>

        {!compact && (
          <div style={{ display: "flex", gap: 4, background: "var(--surface)", padding: 2, borderRadius: 99, border: "1px solid var(--border)" }}>
            {(["all", "olive", "golden", "neutral", "cool"] as const).map((ut) => (
              <button
                key={ut}
                type="button"
                onClick={() => setSelectedUndertone(ut)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 99,
                  border: "none",
                  fontSize: 10.5,
                  fontWeight: selectedUndertone === ut ? 700 : 500,
                  background: selectedUndertone === ut ? "var(--accent)" : "transparent",
                  color: selectedUndertone === ut ? "#fff" : "var(--text-soft)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s ease",
                }}
              >
                {ut}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Swatch Carousel / Grid */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          overflowX: "auto",
          padding: "6px 2px 10px",
        }}
      >
        {filteredProfiles.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className={`skin-tone-ring ${isActive ? "active" : ""}`}
              title={`${p.name} (${p.shadeCode}) - ${p.undertone} undertone`}
              style={{ flexShrink: 0 }}
            >
              <div
                className="skin-tone-inner"
                style={{
                  background: p.hex,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Selected Tone Detail Card & Color Harmony Advisor */}
      <div
        className="glass-panel-luxury specular-top"
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: activeProfile.hex,
                border: "2px solid rgba(255, 255, 255, 0.4)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            />
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                {activeProfile.name}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-soft)", marginLeft: 6 }}>
                ({activeProfile.shadeCode} · {activeProfile.undertone} undertone)
              </span>
            </div>
          </div>
          <span
            className="glass-pill"
            style={{ fontSize: 10.5, color: "#00c98d", borderColor: "rgba(0, 201, 141, 0.3)" }}
          >
            ✓ Anti-Whitewash Active
          </span>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5, margin: 0 }}>
          {activeProfile.description}
        </p>

        {/* Color Harmony Guidance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
          {/* Flattering Colors */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <span style={{ color: "#00c98d" }}>●</span> Recommended Garment Colors:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeProfile.bestColors.map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 99,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: 10.5,
                    color: "var(--text)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: c.hex,
                      boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                    }}
                  />
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* Colors to avoid */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-soft)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <span style={{ color: "#f43f5e" }}>○</span> Avoid / Washes Out:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeProfile.avoidColors.map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 99,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: 10.5,
                    color: "var(--muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: c.hex,
                    }}
                  />
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
