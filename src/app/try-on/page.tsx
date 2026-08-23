"use client";

import { useEffect, useState, useCallback } from "react";
import type { AvatarType } from "../../components/AvatarSelector";
import type { AvatarBodyProfile } from "../../components/AvatarSelector";
import CharacterModel from "../../components/CharacterModel";
import TacticalCharacter from "../../components/TacticalCharacter";
import { generateOutfitTryOn, fetchGarmentFromUrl, tryOnFromUrl } from "../../services/api";

type GarmentCategory = "upper_body" | "lower_body" | "dresses";
type Mode = "upload" | "link";

const defaultBodyProfile: AvatarBodyProfile = { age: 25, heightCm: 170, weightKg: 65 };

/* ─── Shared Upload Zone ──────────────────────────────────────────────────── */
type UploadZoneProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  previewUrl: string | null;
  onSelect: (file: File | null) => void;
  compact?: boolean;
};

function UploadZone({ id, label, icon, previewUrl, onSelect, compact }: UploadZoneProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onSelect(e.target.files?.[0] ?? null);
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onSelect(f);
  };
  return (
    <label
      className={`upload-zone-new${compact ? " upload-zone-compact" : ""}`}
      htmlFor={id}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input id={id} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleChange} />
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="upload-zone-full-preview" />
      ) : (
        <>
          <div className="upload-icon">{icon}</div>
          <div className="upload-zone-text">
            <p>Drop {label} here or <span className="upload-browse">Browse</span></p>
          </div>
        </>
      )}
    </label>
  );
}

/* ─── SVG Icons ───────────────────────────────────────────────────────────── */
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const HangerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M12 4v4" />
    <path d="M3 18l9-8 9 8" /><path d="M1 20h22" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function TryOnPage() {
  // ── Mode toggle ────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("upload");

  // ── Shared state ───────────────────────────────────────────────────────────
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>("upper_body");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [use3D, setUse3D] = useState(true);

  // ── Upload-mode state ──────────────────────────────────────────────────────
  const [gender, setGender] = useState<AvatarType>("female");
  const [bodyProfile, setBodyProfile] = useState<AvatarBodyProfile>(defaultBodyProfile);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);

  // ── Link-mode state ────────────────────────────────────────────────────────
  const [outfitUrl, setOutfitUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);

  // ── Loading phase text ─────────────────────────────────────────────────────
  const [progressPhase, setProgressPhase] = useState(0);
  const progressMessages = ["Analysing images…", "Fitting outfit to body…", "Rendering fabric & lighting…", "Finalising result…"];

  useEffect(() => {
    if (!selfieFile) { setSelfiePreview(null); return; }
    const url = URL.createObjectURL(selfieFile);
    setSelfiePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selfieFile]);

  useEffect(() => {
    if (!outfitFile) { setOutfitPreview(null); return; }
    const url = URL.createObjectURL(outfitFile);
    setOutfitPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [outfitFile]);

  useEffect(() => {
    if (!isLoading) { setProgressPhase(0); return; }
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % progressMessages.length; setProgressPhase(i); }, 3500);
    return () => clearInterval(id);
  }, [isLoading]);

  // Reset result when switching modes
  const switchMode = (m: Mode) => {
    setMode(m);
    setErrorMessage(null);
    setFetchError(null);
  };

  /* ── Fetch garment from URL ─────────────────────────────────────────────── */
  const handleFetchGarment = useCallback(async () => {
    if (!outfitUrl.trim()) return;
    setFetchError(null);
    setGarmentImageUrl(null);
    setIsFetching(true);
    try {
      const result = await fetchGarmentFromUrl(outfitUrl.trim());
      setGarmentImageUrl(result.garmentImageUrl);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch outfit.");
    } finally {
      setIsFetching(false);
    }
  }, [outfitUrl]);

  /* ── Generate ───────────────────────────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!selfieFile) { setErrorMessage("Please upload your photo."); return; }
    if (mode === "upload" && !outfitFile) { setErrorMessage("Please upload a garment image."); return; }
    if (mode === "link" && !garmentImageUrl) { setErrorMessage("Please fetch an outfit from a URL first."); return; }

    setErrorMessage(null);
    setIsLoading(true);
    setResultImage(null);

    try {
      let response;
      if (mode === "upload") {
        response = await generateOutfitTryOn({ avatarType: gender, bodyProfile, selfieFile, outfitFile: outfitFile!, garmentCategory });
      } else {
        response = await tryOnFromUrl({ selfieFile, garmentUrl: garmentImageUrl!, garmentCategory });
      }
      setResultImage(response.resultImageUrl);
      sessionStorage.setItem("tryOnResultImage", response.resultImageUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Download / Share ───────────────────────────────────────────────────── */
  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a"); a.href = resultImage; a.download = "ai-fit-result.png"; a.click();
  };
  const handleShare = async () => {
    if (!resultImage) return;
    if (navigator.share) { await navigator.share({ title: "My AI Fit Studio Look", url: resultImage }); }
    else { await navigator.clipboard.writeText(resultImage).catch(() => {}); alert("Result URL copied!"); }
  };

  const modelUrl = gender === "female" ? "/models/michelle.glb" : "/models/soldier.glb";
  const canGenerate = !!selfieFile && (mode === "upload" ? !!outfitFile : !!garmentImageUrl) && !isLoading;

  const categoryLabels: Record<GarmentCategory, string> = {
    upper_body: "Top",
    lower_body: "Bottom",
    dresses: "Dress",
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="app-layout">
      <div className="studio-grid">

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <aside className="create-panel">

          {/* Mode switcher */}
          <div className="mode-switcher">
            <button
              id="mode-upload-btn"
              type="button"
              className={`mode-tab${mode === "upload" ? " mode-tab-active" : ""}`}
              onClick={() => switchMode("upload")}
            >
              <UploadIcon />
              Upload Outfit
            </button>
            <button
              id="mode-link-btn"
              type="button"
              className={`mode-tab mode-tab-link${mode === "link" ? " mode-tab-active mode-tab-link-active" : ""}`}
              onClick={() => switchMode("link")}
            >
              <LinkIcon />
              Try from Link
            </button>
          </div>

          {/* ─── UPLOAD MODE ─────────────────────────────────────────────── */}
          {mode === "upload" && (
            <>
              {/* 1. Basic Info */}
              <div>
                <div className="section-label">1. Basic Info</div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Select Gender</p>
                <div className="gender-row">
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`gender-btn${gender === g.toLowerCase() ? " active" : ""}`}
                      onClick={() => setGender(g.toLowerCase() as AvatarType)}
                    >{g}</button>
                  ))}
                </div>

                <div className="metrics-row">
                  <div className="metric-field">
                    <span className="metric-label">Age</span>
                    <div className="metric-input-wrap">
                      <input className="metric-input" type="number" min={13} max={99}
                        value={bodyProfile.age || ""}
                        onChange={(e) => setBodyProfile({ ...bodyProfile, age: Number(e.target.value) || 0 })}
                        style={{ width: 60 }} />
                    </div>
                  </div>
                  <div className="metric-field">
                    <span className="metric-label">Height</span>
                    <div className="metric-input-wrap">
                      <input className="metric-input" type="number" min={100} max={230}
                        value={bodyProfile.heightCm || ""}
                        onChange={(e) => setBodyProfile({ ...bodyProfile, heightCm: Number(e.target.value) || 0 })} />
                      <span className="metric-unit-btn">cm</span>
                    </div>
                  </div>
                  <div className="metric-field">
                    <span className="metric-label">Weight</span>
                    <div className="metric-input-wrap">
                      <input className="metric-input" type="number" min={30} max={200}
                        value={bodyProfile.weightKg || ""}
                        onChange={(e) => setBodyProfile({ ...bodyProfile, weightKg: Number(e.target.value) || 0 })} />
                      <span className="metric-unit-btn">kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Upload Selfie */}
              <div className="upload-section">
                <div className="section-label">2. Upload Selfie</div>
                <UploadZone id="selfie-upload" label="selfie photo" icon={<CameraIcon />} previewUrl={selfiePreview} onSelect={setSelfieFile} />
                {selfiePreview && (
                  <button type="button" className="clear-btn" onClick={() => setSelfieFile(null)}>✕ Remove</button>
                )}
              </div>

              {/* 3. Upload Dress */}
              <div className="upload-section">
                <div className="section-label">3. Upload Dress</div>
                <div className="gender-row" style={{ marginBottom: 10 }}>
                  {(Object.entries(categoryLabels) as [GarmentCategory, string][]).map(([cat, label]) => (
                    <button key={cat} type="button"
                      className={`gender-btn${garmentCategory === cat ? " active" : ""}`}
                      style={{ fontSize: 11, padding: "6px 8px" }}
                      onClick={() => setGarmentCategory(cat)}
                    >{label}</button>
                  ))}
                </div>
                <UploadZone id="outfit-upload" label="garment image" icon={<HangerIcon />} previewUrl={outfitPreview} onSelect={setOutfitFile} />
                {outfitPreview && (
                  <button type="button" className="clear-btn" onClick={() => setOutfitFile(null)}>✕ Remove</button>
                )}
              </div>
            </>
          )}

          {/* ─── LINK MODE ───────────────────────────────────────────────── */}
          {mode === "link" && (
            <>
              {/* Step 1 — URL */}
              <div>
                <div className="section-label">1. Paste Outfit Link</div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                  Copy a product URL from Myntra, Amazon, ASOS, Zara, Flipkart or any fashion store.
                </p>

                <div className="link-url-input-row">
                  <div className="link-url-wrap">
                    <svg className="link-url-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      onKeyDown={(e) => e.key === "Enter" && handleFetchGarment()}
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
                    {isFetching
                      ? <span className="spinner spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.25)" }} />
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" /></svg>
                    }
                    {isFetching ? "Fetching…" : "Fetch"}
                  </button>
                </div>

                {fetchError && (
                  <div className="status-error" style={{ marginTop: 10 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {fetchError}
                  </div>
                )}

                {/* Garment preview after fetch */}
                {garmentImageUrl && (
                  <div className="garment-fetched-preview">
                    <div className="garment-fetched-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Outfit found!
                    </div>
                    <img src={garmentImageUrl} alt="Fetched garment" className="garment-fetched-img" />
                    <button type="button" className="clear-btn" onClick={() => { setGarmentImageUrl(null); setOutfitUrl(""); }}>✕ Change outfit</button>
                  </div>
                )}

                {/* Category selector */}
                {garmentImageUrl && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Garment type:</p>
                    <div className="gender-row">
                      {(Object.entries(categoryLabels) as [GarmentCategory, string][]).map(([cat, label]) => (
                        <button key={cat} type="button"
                          className={`gender-btn${garmentCategory === cat ? " active" : ""}`}
                          style={{ fontSize: 11, padding: "6px 8px" }}
                          onClick={() => setGarmentCategory(cat)}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 — Selfie */}
              <div className="upload-section">
                <div className="section-label">2. Upload Your Photo</div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                  Clear front-facing photo — the AI will dress you in the outfit.
                </p>
                <UploadZone id="selfie-upload-link" label="your photo" icon={<CameraIcon />} previewUrl={selfiePreview} onSelect={setSelfieFile} />
                {selfiePreview && (
                  <button type="button" className="clear-btn" onClick={() => setSelfieFile(null)}>✕ Remove</button>
                )}
              </div>

              {/* Supported sites */}
              <div className="supported-sites-inline">
                <span className="supported-label">Works with</span>
                {["Myntra", "Amazon", "ASOS", "Zara", "Flipkart"].map((s) => (
                  <span key={s} className="site-badge">{s}</span>
                ))}
              </div>
            </>
          )}

          {/* ─── Error ───────────────────────────────────────────────────── */}
          {errorMessage && (
            <div className="status-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {errorMessage}
            </div>
          )}

          {/* ─── Generate button ─────────────────────────────────────────── */}
          <button
            id="generate-btn"
            type="button"
            className="generate-btn"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            <span className="generate-btn-inner">
              {isLoading && <span className="spinner spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.25)" }} />}
              {isLoading ? "Generating Look…" : "✨  Generate Look"}
            </span>
          </button>
        </aside>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div className="preview-panel">
          <div className="preview-panel-header">
            <h2 className="preview-panel-title">
              {resultImage ? "Your AI Try-On Result" : mode === "link" ? "AI Try-On Preview" : "Your Virtual Twin"}
            </h2>
            {resultImage && (
              <span className="result-ready-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                Ready
              </span>
            )}
          </div>

          {/* Stage */}
          <div className="virtual-twin-stage">
            {isLoading && (
              <div className="stage-loading">
                <div className="stage-spinner-wrap">
                  <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, borderColor: "rgba(27,58,107,0.12)", borderTopColor: "var(--primary-bg)" }} />
                  <div className="stage-spinner-ring" />
                </div>
                <p className="stage-loading-phase">{progressMessages[progressPhase]}</p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>Usually 30–90 seconds</p>
              </div>
            )}

            <div className="stage-content">
              {resultImage ? (
                <img src={resultImage} alt="AI try-on result" className="result-3d-image" />
              ) : use3D && mode === "upload" ? (
                <CharacterModel url={modelUrl} mode="stage" onLoadError={() => setUse3D(false)} />
              ) : (
                <div className="stage-placeholder">
                  <div className="stage-placeholder-icon">
                    {mode === "link" ? (
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    ) : (
                      <TacticalCharacter variant={gender} className="" />
                    )}
                  </div>
                  <p>
                    {mode === "link"
                      ? "Paste an outfit URL · Upload your photo · Click Generate"
                      : "Upload images and click Generate Look to see your outfit preview"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="preview-action-bar">
            <div style={{ marginRight: "auto", fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              {resultImage
                ? "✨ Tap an action below"
                : mode === "link"
                ? "🔗 Link mode — paste a product URL"
                : "📁 Upload mode — add your files"}
            </div>

            <button type="button" className="action-btn" onClick={handleShare} disabled={!resultImage} title="Share result">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>

            <button type="button" className="action-btn" onClick={handleDownload} disabled={!resultImage} title="Download image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>

            {resultImage && (
              <button type="button" className="action-btn"
                onClick={() => { setResultImage(null); }}
                title="Try again"
              >
                Try Again
              </button>
            )}

            <button type="button" className="action-btn action-btn-primary" disabled={!resultImage} title="Save to profile">
              Save to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
