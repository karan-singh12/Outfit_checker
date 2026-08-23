"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchGarmentFromUrl, tryOnFromUrl } from "../../../services/api";

// ─── Garment category type ───────────────────────────────────────────────────
type GarmentCategory = "upper_body" | "lower_body" | "dresses";

// ─── Upload Zone ─────────────────────────────────────────────────────────────
type UploadZoneProps = {
  id: string;
  label: string;
  previewUrl: string | null;
  onSelect: (file: File | null) => void;
};

function UploadZone({ id, label, previewUrl, onSelect }: UploadZoneProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.files?.[0] ?? null);
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onSelect(file);
  };

  return (
    <label
      className="upload-zone-new link-upload-zone"
      htmlFor={id}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input id={id} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleChange} />
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="upload-zone-preview-img" />
      ) : (
        <>
          <div className="link-upload-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="link-upload-text">Drop {label} here or <span className="upload-browse">Browse</span></p>
          <p className="link-upload-hint">PNG, JPG or WEBP</p>
        </>
      )}
    </label>
  );
}

// ─── Step badge ───────────────────────────────────────────────────────────────
function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="link-step-badge">
      <span className="link-step-num">{n}</span>
      <span className="link-step-label">{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TryOnLinkPage() {
  // Step 1 — URL input
  const [outfitUrl, setOutfitUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);

  // Step 2 — selfie upload
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Garment type
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>("upper_body");

  // Generate
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Progress animation phases
  const [progressPhase, setProgressPhase] = useState(0);

  useEffect(() => {
    if (!selfieFile) { setSelfiePreview(null); return; }
    const url = URL.createObjectURL(selfieFile);
    setSelfiePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selfieFile]);

  // Animate progress text during generation
  useEffect(() => {
    if (!isGenerating) { setProgressPhase(0); return; }
    const phases = [
      "Fetching garment details…",
      "Analysing your photo…",
      "Fitting outfit to your body…",
      "Rendering final result…",
    ];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % phases.length;
      setProgressPhase(i);
    }, 3000);
    return () => clearInterval(id);
  }, [isGenerating]);

  const progressMessages = [
    "Fetching garment details…",
    "Analysing your photo…",
    "Fitting outfit to your body…",
    "Rendering final result…",
  ];

  // ── Fetch garment from URL ──────────────────────────────────────────────────
  const handleFetchGarment = useCallback(async () => {
    if (!outfitUrl.trim()) return;
    setFetchError(null);
    setGarmentImageUrl(null);
    setIsFetching(true);
    try {
      const result = await fetchGarmentFromUrl(outfitUrl.trim());
      setGarmentImageUrl(result.garmentImageUrl);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch outfit image.");
    } finally {
      setIsFetching(false);
    }
  }, [outfitUrl]);

  // Allow Enter key to trigger fetch
  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleFetchGarment();
  };

  // ── Generate try-on ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selfieFile || !garmentImageUrl) {
      setGenerateError("Please complete both steps first.");
      return;
    }
    setGenerateError(null);
    setIsGenerating(true);
    setResultImage(null);
    try {
      const response = await tryOnFromUrl({ selfieFile, garmentUrl: garmentImageUrl, garmentCategory });
      setResultImage(response.resultImageUrl);
      sessionStorage.setItem("tryOnResultImage", response.resultImageUrl);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = "ai-fit-studio-link-result.png";
    a.click();
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

  const canGenerate = !!garmentImageUrl && !!selfieFile && !isGenerating;
  const categoryLabels: Record<GarmentCategory, string> = {
    upper_body: "Top / Shirt",
    lower_body: "Bottom / Pants",
    dresses: "Dress / Full",
  };

  return (
    <div className="app-layout">
      <div className="link-tryon-page">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="link-page-header">
          <div className="link-page-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h1 className="link-page-title">Try Outfit from Link</h1>
            <p className="link-page-subtitle">Paste any fashion product URL · Upload your photo · See yourself in it</p>
          </div>
        </div>

        <div className="link-tryon-grid">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="link-left-col">

            {/* STEP 1 — URL Input */}
            <div className="link-card">
              <StepBadge n={1} label="Paste Outfit Link" />
              <p className="link-card-desc">
                Copy a product URL from Myntra, Amazon, ASOS, Zara, Flipkart or any fashion store.
              </p>

              <div className="link-url-input-row">
                <div className="link-url-wrap">
                  <svg className="link-url-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <input
                    id="outfit-url-input"
                    type="url"
                    className="link-url-input"
                    placeholder="https://www.myntra.com/shirts/..."
                    value={outfitUrl}
                    onChange={(e) => setOutfitUrl(e.target.value)}
                    onKeyDown={handleUrlKeyDown}
                    disabled={isFetching}
                  />
                </div>
                <button
                  id="fetch-garment-btn"
                  type="button"
                  className="link-fetch-btn"
                  onClick={handleFetchGarment}
                  disabled={!outfitUrl.trim() || isFetching}
                >
                  {isFetching ? (
                    <span className="spinner spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.25)" }} />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                    </svg>
                  )}
                  {isFetching ? "Fetching…" : "Fetch Outfit"}
                </button>
              </div>

              {fetchError && (
                <div className="status-error" style={{ marginTop: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fetchError}
                </div>
              )}

              {/* Garment Preview */}
              {garmentImageUrl && (
                <div className="link-garment-preview">
                  <div className="link-garment-preview-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Outfit found!
                  </div>
                  <img src={garmentImageUrl} alt="Fetched garment" className="link-garment-img" />
                  <button
                    type="button"
                    className="link-garment-change"
                    onClick={() => { setGarmentImageUrl(null); setOutfitUrl(""); }}
                  >
                    Change outfit
                  </button>
                </div>
              )}

              {/* Category selector — only show after garment fetched */}
              {garmentImageUrl && (
                <div className="link-category-row">
                  <span className="link-category-label">Garment type:</span>
                  {(Object.entries(categoryLabels) as [GarmentCategory, string][]).map(([cat, label]) => (
                    <button
                      key={cat}
                      type="button"
                      className={`gender-btn${garmentCategory === cat ? " active" : ""}`}
                      style={{ fontSize: 11, padding: "6px 10px" }}
                      onClick={() => setGarmentCategory(cat)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 2 — Selfie Upload */}
            <div className={`link-card${!garmentImageUrl ? " link-card-dimmed" : ""}`}>
              <StepBadge n={2} label="Upload Your Photo" />
              <p className="link-card-desc">
                Take a clear front-facing photo. The AI will place you in the outfit.
              </p>
              <UploadZone
                id="selfie-upload-link"
                label="your photo"
                previewUrl={selfiePreview}
                onSelect={setSelfieFile}
              />
              {selfiePreview && (
                <button
                  type="button"
                  className="link-garment-change"
                  style={{ marginTop: 8 }}
                  onClick={() => setSelfieFile(null)}
                >
                  Change photo
                </button>
              )}
            </div>

            {/* Generate button */}
            <button
              id="generate-tryon-btn"
              type="button"
              className="generate-btn"
              style={{ width: "100%" }}
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              <span className="generate-btn-inner">
                {isGenerating && (
                  <span className="spinner spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.25)" }} />
                )}
                {isGenerating ? "Generating…" : "✨  Try On Now"}
              </span>
            </button>

            {generateError && (
              <div className="status-error" style={{ marginTop: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {generateError}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Result ────────────────────────────────────── */}
          <div className="link-right-col">
            <div className="link-result-card">

              {isGenerating ? (
                <div className="link-result-loading">
                  <div className="link-result-spinner">
                    <div className="spinner link-spinner-lg" />
                    <div className="link-spinner-ring" />
                  </div>
                  <p className="link-loading-phase">{progressMessages[progressPhase]}</p>
                  <p className="link-loading-hint">This usually takes 30–90 seconds</p>
                  <div className="link-loading-steps">
                    {progressMessages.map((msg, i) => (
                      <div key={i} className={`link-loading-step${i <= progressPhase ? " active" : ""}${i < progressPhase ? " done" : ""}`}>
                        <span className="link-loading-step-dot" />
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : resultImage ? (
                <div className="link-result-content">
                  <div className="link-result-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    AI Try-On Complete
                  </div>
                  <img src={resultImage} alt="AI try-on result" className="link-result-img" />
                  <div className="link-result-actions">
                    <button type="button" className="action-btn action-btn-primary" onClick={handleDownload}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                    <button type="button" className="action-btn" onClick={handleShare}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Share
                    </button>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => { setResultImage(null); setGarmentImageUrl(null); setOutfitUrl(""); setSelfieFile(null); }}
                    >
                      Try Another
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="link-result-empty">
                  <div className="link-result-empty-visual">
                    {/* Animated outfit preview silhouette */}
                    <div className="link-empty-avatar">
                      <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="35" r="22" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
                        <path d="M28 80 Q60 60 92 80 L98 160 H22 Z" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.25)" strokeWidth="1.5" />
                        <path d="M28 80 L10 130 L30 135 L38 100" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1.5" />
                        <path d="M92 80 L110 130 L90 135 L82 100" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1.5" />
                      </svg>
                      <div className="link-empty-avatar-glow" />
                    </div>

                    {/* Floating link badge */}
                    <div className="link-empty-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      Link → Try-On
                    </div>
                  </div>

                  <h3 className="link-result-empty-title">Your Try-On Result Appears Here</h3>
                  <p className="link-result-empty-desc">
                    Paste an outfit URL on the left, upload your photo,<br />and click <strong>Try On Now</strong>.
                  </p>

                  <div className="link-tips">
                    <div className="link-tip">
                      <span className="link-tip-icon">💡</span>
                      <span>Works best with front-facing, full-body or waist-up photos</span>
                    </div>
                    <div className="link-tip">
                      <span className="link-tip-icon">✅</span>
                      <span>Supports Myntra, Amazon, ASOS, Zara, Flipkart &amp; more</span>
                    </div>
                    <div className="link-tip">
                      <span className="link-tip-icon">⏱️</span>
                      <span>Generation takes 30–90 seconds (AI cold start)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
