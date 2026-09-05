"use client";

import React, { useState } from "react";

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  image?: string;
}

export interface OutfitPollProps {
  id: string;
  title: string;
  creatorName?: string;
  creatorAvatar?: string;
  type: "duel" | "verdict";
  options: PollOption[];
  userVotedOptionId?: string | null;
  totalVotes?: number;
  timeRemaining?: string;
  onVote?: (pollId: string, optionId: string) => void;
  compact?: boolean;
}

export default function OutfitPollCard({
  id,
  title,
  creatorName = "Stylist",
  creatorAvatar,
  type = "duel",
  options: initialOptions,
  userVotedOptionId = null,
  totalVotes: initialTotalVotes,
  timeRemaining = "2h left",
  onVote,
  compact = false,
}: OutfitPollProps) {
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [votedId, setVotedId] = useState<string | null>(userVotedOptionId);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (optionId: string) => {
    if (votedId === optionId) return;

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
        if (opt.id === votedId) return { ...opt, votes: Math.max(0, opt.votes - 1) };
        return opt;
      })
    );
    setVotedId(optionId);
    onVote?.(id, optionId);
  };

  const getPercent = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div
      className="glass-panel-luxury specular-top"
      style={{
        padding: compact ? "14px 16px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
        maxWidth: compact ? 420 : 540,
      }}
    >
      {/* Poll Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00c98d, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {creatorName[0].toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "var(--text)" }}>{title}</p>
            <p style={{ fontSize: 11, color: "var(--text-soft)", margin: 0 }}>
              Posted by {creatorName} · {timeRemaining}
            </p>
          </div>
        </div>

        <span
          className="glass-pill"
          style={{ fontSize: 10.5, borderColor: "rgba(14, 165, 233, 0.3)", color: "#0ea5e9" }}
        >
          {type === "duel" ? "Look Duel" : "Style Verdict"}
        </span>
      </div>

      {/* Duel Layout: Side by Side Images */}
      {type === "duel" && options.length === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {options.map((opt) => {
            const percent = getPercent(opt.votes);
            const isSelected = votedId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: "var(--r-md)",
                  background: isSelected ? "rgba(0, 201, 141, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: isSelected ? "1.5px solid #00c98d" : "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.2s ease",
                }}
              >
                {opt.image && (
                  <div
                    style={{
                      width: "100%",
                      height: 160,
                      borderRadius: "var(--r-sm)",
                      overflow: "hidden",
                      position: "relative",
                      background: "#131318",
                    }}
                  >
                    <img
                      src={opt.image}
                      alt={opt.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "#00c98d",
                          color: "#fff",
                          borderRadius: 99,
                          padding: "2px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        }}
                      >
                        ✓ Voted
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{opt.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#00c98d" : "var(--text-soft)" }}>
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: isSelected ? "linear-gradient(90deg, #00c98d, #0ea5e9)" : "rgba(255,255,255,0.3)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verdict / List Layout */}
      {type === "verdict" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt) => {
            const percent = getPercent(opt.votes);
            const isSelected = votedId === opt.id;
            return (
              <div
                key={opt.id}
                className="poll-bar-track"
                onClick={() => handleVote(opt.id)}
                style={{
                  borderColor: isSelected ? "rgba(0, 201, 141, 0.45)" : undefined,
                  boxShadow: isSelected ? "0 0 14px rgba(0, 201, 141, 0.15)" : undefined,
                }}
              >
                <div
                  className="poll-bar-fill"
                  style={{
                    width: `${percent}%`,
                    background: isSelected
                      ? "linear-gradient(90deg, rgba(0, 201, 141, 0.28), rgba(14, 165, 233, 0.35))"
                      : "rgba(255, 255, 255, 0.08)",
                    borderRightColor: isSelected ? "#00c98d" : "rgba(255, 255, 255, 0.2)",
                  }}
                />
                <div className="poll-bar-content">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isSelected && (
                      <span style={{ color: "#00c98d", fontSize: 12 }}>●</span>
                    )}
                    <span>{opt.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#00c98d" : "var(--text-soft)" }}>
                    {percent}% ({opt.votes})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Vote Tally */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 11, color: "var(--text-soft)" }}>
          {totalVotes} total vote{totalVotes !== 1 ? "s" : ""} {votedId ? "· Vote recorded" : "· Click to vote"}
        </span>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: title, url: window.location.href }).catch(() => {});
            }
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: 11,
            color: "var(--accent)",
            cursor: "pointer",
            fontWeight: 600,
            padding: 0,
          }}
        >
          Share Poll →
        </button>
      </div>
    </div>
  );
}
