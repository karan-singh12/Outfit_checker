"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoredBody = { age: number; heightCm: number; weightKg: number };

export default function TryOnResultPage() {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [avatarType, setAvatarType] = useState<string>("operator");
  const [bodyProfile, setBodyProfile] = useState<StoredBody | null>(null);
  const [beforeAfter, setBeforeAfter] = useState(false);

  useEffect(() => {
    const image = sessionStorage.getItem("tryOnResultImage");
    const avatar = sessionStorage.getItem("tryOnAvatarType");
    const bodyRaw = sessionStorage.getItem("tryOnBodyProfile");

    if (image) setResultImage(image);
    if (avatar) setAvatarType(avatar);
    if (bodyRaw) {
      try {
        const parsed = JSON.parse(bodyRaw) as StoredBody;
        if (
          typeof parsed.age === "number" &&
          typeof parsed.heightCm === "number" &&
          typeof parsed.weightKg === "number"
        ) {
          setBodyProfile(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "ai-fit-studio-result.png";
    link.click();
  };

  const handleShare = async () => {
    if (!resultImage) return;
    if (navigator.share) {
      await navigator.share({ title: "My AI Fit Studio Look", url: resultImage });
    } else {
      await navigator.clipboard.writeText(resultImage).catch(() => {});
      alert("Result URL copied to clipboard!");
    }
  };

  return (
    <div className="result-only-page">
      <div className="result-stage-card">
        {/* Header */}
        <div className="result-stage-header">
          <p style={{ fontSize: 12, color: "var(--accent-blue)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Final Render
          </p>
          <h1>
            {avatarType.charAt(0).toUpperCase() + avatarType.slice(1)} Character Output
          </h1>
          {bodyProfile && (
            <div className="result-meta-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Age {bodyProfile.age} &middot; {bodyProfile.heightCm} cm &middot; {bodyProfile.weightKg} kg
            </div>
          )}
        </div>

        {/* 3D Viewer Space */}
        <div className="result-3d-viewer">
          <div className="result-3d-image-container">
            {resultImage ? (
              <img
                src={resultImage}
                alt="Generated 3D outfit character"
                className="result-3d-character"
              />
            ) : (
              <div style={{
                position: "relative",
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                padding: 40,
                textAlign: "center",
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.8)",
                  border: "2px dashed #c5d0e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                }}>
                  🧍
                </div>
                <p style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 500 }}>
                  No result found. Go back and generate a look first.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="result-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)" }}>Before &amp; After</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={beforeAfter}
                onChange={(e) => setBeforeAfter(e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>

          <Link href="/try-on" className="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Studio
          </Link>

          <button type="button" className="action-btn" onClick={handleShare} disabled={!resultImage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>

          <button type="button" className="action-btn" onClick={handleDownload} disabled={!resultImage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Image
          </button>

          <button type="button" className="action-btn action-btn-primary" disabled={!resultImage}>
            Save to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
