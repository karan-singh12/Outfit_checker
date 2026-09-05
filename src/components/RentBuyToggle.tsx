"use client";

import React, { useState } from "react";

interface RentBuyToggleProps {
  buyPrice: number; // in INR
  rentalPrice?: number; // optional custom rental price
  rentalDays?: number;
  rentalPartner?: string;
  onModeChange?: (mode: "buy" | "rent") => void;
  compact?: boolean;
}

export default function RentBuyToggle({
  buyPrice,
  rentalPrice,
  rentalDays = 4,
  rentalPartner = "Flyrobe / Stage3",
  onModeChange,
  compact = false,
}: RentBuyToggleProps) {
  const [mode, setMode] = useState<"buy" | "rent">("buy");
  const [showInfo, setShowInfo] = useState(false);

  // Default rental price is ~14% of retail price, rounded to nearest 99
  const calculatedRentalPrice = rentalPrice || Math.max(499, Math.round((buyPrice * 0.14) / 100) * 100 - 1);
  const savingsAmount = Math.max(0, buyPrice - calculatedRentalPrice);
  const savingsPercent = Math.round((savingsAmount / buyPrice) * 100);
  const breakevenWears = Math.max(2, Math.ceil(buyPrice / calculatedRentalPrice));

  const handleToggle = (nextMode: "buy" | "rent") => {
    setMode(nextMode);
    onModeChange?.(nextMode);
  };

  return (
    <div className="rent-buy-widget" style={{ display: "inline-flex", flexDirection: "column", gap: 6, position: "relative" }}>
      {/* Switcher & Price Display */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <div className="rent-buy-container">
          <button
            type="button"
            className={`rent-buy-btn ${mode === "buy" ? "active" : ""}`}
            onClick={() => handleToggle("buy")}
            aria-label="Select Buy Mode"
          >
            Buy
            <span style={{ opacity: 0.85, fontSize: 10 }}>₹{buyPrice.toLocaleString("en-IN")}</span>
          </button>
          <button
            type="button"
            className={`rent-buy-btn ${mode === "rent" ? "active" : ""}`}
            onClick={() => handleToggle("rent")}
            aria-label="Select Rent Mode"
          >
            Rent
            <span style={{ opacity: 0.9, fontSize: 10 }}>₹{calculatedRentalPrice.toLocaleString("en-IN")}</span>
          </button>
        </div>

        {/* Info / CPW Breakdown button */}
        <button
          type="button"
          onClick={() => setShowInfo((prev) => !prev)}
          title="Cost-Per-Wear & Rental Economics"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "var(--text-soft)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "all 0.15s ease",
          }}
        >
          ₹
        </button>
      </div>

      {/* Mode Sub-pill */}
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mode === "rent" ? (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#00c98d",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00c98d" }} />
              Save {savingsPercent}% (₹{savingsAmount.toLocaleString("en-IN")}) for {rentalDays}-day event
            </span>
          ) : (
            <span style={{ fontSize: 10.5, color: "var(--text-soft)" }}>
              Full ownership · Breakeven at {breakevenWears}+ wears
            </span>
          )}
        </div>
      )}

      {/* CPW Calculator Popover */}
      {showInfo && (
        <div
          className="glass-panel-luxury specular-top"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 8,
            width: 270,
            padding: 14,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
              Rent vs. Buy Analysis
            </span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              style={{ background: "none", border: "none", color: "var(--text-soft)", cursor: "pointer", fontSize: 14, padding: 0 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5, color: "var(--text-soft)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Retail Price:</span>
              <strong style={{ color: "var(--text)" }}>₹{buyPrice.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Rental ({rentalDays} days):</span>
              <strong style={{ color: "#00c98d" }}>₹{calculatedRentalPrice.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
              <span>Instant Event Savings:</span>
              <strong style={{ color: "#00c98d" }}>₹{savingsAmount.toLocaleString("en-IN")} ({savingsPercent}%)</strong>
            </div>
          </div>

          <div
            style={{
              padding: "6px 8px",
              borderRadius: "var(--r-xs)",
              background: "rgba(0, 201, 141, 0.08)",
              border: "1px solid rgba(0, 201, 141, 0.2)",
              fontSize: 10.5,
              color: "var(--text)",
              lineHeight: 1.4,
            }}
          >
            💡 <strong>Smart Decision:</strong> If wearing for 1–2 events (weddings, galas), renting saves cash. If wearing {breakevenWears}+ times, buying yields a lower Cost-Per-Wear!
          </div>

          <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
            Fulfilled via {rentalPartner}
          </div>
        </div>
      )}
    </div>
  );
}
