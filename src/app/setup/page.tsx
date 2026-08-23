"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;

const SKIN_TONES = ["#FDDBB4","#F5C99E","#E8AC78","#C68642","#8D5524","#4A2912"];
const HAIR_COLORS = ["#1a1a1a","#4b3728","#7c4f28","#b08040","#d4a843","#e8c86a","#c0c0c0","#f5f5f5","#c0392b","#8e44ad"];

const BUILDING_STEPS = [
  "Analysing facial features…",
  "Mapping body proportions…",
  "Generating 3D mesh…",
  "Applying skin tone & hair…",
  "Finalising your digital twin…",
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState(SKIN_TONES[0]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");
  const [age, setAge] = useState("25");
  const [buildingStep, setBuildingStep] = useState(0);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!selfieFile) { setSelfiePreview(null); return; }
    const url = URL.createObjectURL(selfieFile);
    setSelfiePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selfieFile]);

  // Animate building steps
  useEffect(() => {
    if (step !== 3) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setBuildingStep(i);
      if (i >= BUILDING_STEPS.length) {
        clearInterval(id);
        setTimeout(() => router.push("/studio"), 1200);
      }
    }, 900);
    return () => clearInterval(id);
  }, [step, router]);

  const stepLabels = ["Upload Photo", "Body Profile", "Building Twin"];
  const stepStatus = (n: number) =>
    n < step ? "done" : n === step ? "active" : "";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) setSelfieFile(f);
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        {/* Progress */}
        <div className="setup-progress">
          {stepLabels.map((label, i) => (
            <div key={i} className={`setup-step-dot ${stepStatus(i + 1)}`}>
              <div className="setup-step-num">
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className="setup-step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Step 1: Upload Photo ───────────────────────────────────── */}
        {step === 1 && (
          <div className="setup-card">
            <h2 className="setup-card-title">Upload Your Photo</h2>
            <p className="setup-card-desc">
              A clear, front-facing photo works best. Good lighting, neutral expression.
              Your photo is only used to build your avatar — never shared.
            </p>

            <label
              className={`upload-zone${drag ? " drag-over" : ""}${selfiePreview ? " upload-zone-filled" : ""}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
              />
              {selfiePreview ? (
                <img src={selfiePreview} alt="Selfie preview" className="upload-preview" />
              ) : (
                <>
                  <div className="upload-zone-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <p className="upload-zone-title">Drop your photo here</p>
                  <p className="upload-zone-sub">or <span>browse files</span> · PNG, JPG, WEBP</p>
                </>
              )}
            </label>

            {selfiePreview && (
              <button type="button" style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setSelfieFile(null)}>
                ✕ Remove photo
              </button>
            )}

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Skin Tone</p>
                <div className="swatch-row">
                  {SKIN_TONES.map((t) => (
                    <div
                      key={t}
                      className={`swatch${skinTone === t ? " active" : ""}`}
                      style={{ background: t }}
                      onClick={() => setSkinTone(t)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hair Color</p>
                <div className="swatch-row">
                  {HAIR_COLORS.map((h) => (
                    <div
                      key={h}
                      className={`swatch${hairColor === h ? " active" : ""}`}
                      style={{ background: h }}
                      onClick={() => setHairColor(h)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <button
                type="button"
                className="btn btn-gradient"
                style={{ width: "100%" }}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Body Profile ───────────────────────────────────── */}
        {step === 2 && (
          <div className="setup-card">
            <h2 className="setup-card-title">Body Profile</h2>
            <p className="setup-card-desc">
              This helps AI size clothing accurately on your avatar. Completely private.
            </p>

            <div className="metrics-grid">
              {[
                { label: "Age", value: age, set: setAge, unit: "yrs", min: 13, max: 80 },
                { label: "Height", value: height, set: setHeight, unit: "cm", min: 130, max: 220 },
                { label: "Weight", value: weight, set: setWeight, unit: "kg", min: 35, max: 200 },
              ].map((m) => (
                <div key={m.label} className="metric-box">
                  <label>{m.label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      className="metric-input"
                      value={m.value}
                      min={m.min}
                      max={m.max}
                      onChange={(e) => m.set(e.target.value)}
                      style={{ paddingRight: 36 }}
                    />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>
                      {m.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: 16, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "var(--r-md)" }}>
              <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6 }}>
                🔒 Your measurements stay on your device and are only used to generate realistic clothing fit on your avatar.
              </p>
            </div>

            <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn btn-gradient" style={{ flex: 2 }} onClick={() => setStep(3)}>
                Build My Twin ✨
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Building ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="setup-card">
            <div className="twin-building">
              <div className="twin-avatar-ring">
                <div className="twin-ring" />
                <div className="twin-ring twin-ring-2" />
                <div className="twin-avatar-center">
                  {selfiePreview
                    ? <img src={selfiePreview} alt="twin" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : "🧬"}
                </div>
              </div>
              <h3 className="twin-building-title">Building Your Digital Twin</h3>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>This takes just a few seconds…</p>
              <div className="twin-building-steps">
                {BUILDING_STEPS.map((s, i) => (
                  <div key={i} className={`twin-building-step${i === buildingStep ? " active" : i < buildingStep ? " done" : ""}`}>
                    <span className="twin-step-dot" />
                    {i < buildingStep ? "✓ " : ""}{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
