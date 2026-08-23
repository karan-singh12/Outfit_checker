"use client";

import type { AvatarType } from "./AvatarSelector";

type ResultPreviewProps = {
  selfieImage: string | null;
  outfitImage: string | null;
  generatedImage: string | null;
  avatarType: AvatarType;
};

export default function ResultPreview({
  selfieImage,
  outfitImage,
  generatedImage,
  avatarType,
}: ResultPreviewProps) {
  return (
    <section className="panel result-panel-fullpage">
      <h2>Result Preview</h2>
      <p className="panel-subtitle">
        Selfie + outfit mapped into a {avatarType} battle-style character render.
      </p>

      <div className="result-grid">
        <article className="result-card">
          <h3>Selfie Input</h3>
          {selfieImage ? (
            <img src={selfieImage} alt="Selfie input" />
          ) : (
            <div className="preview-placeholder">Upload selfie to preview here.</div>
          )}
        </article>

        <article className="result-card">
          <h3>Outfit Input</h3>
          {outfitImage ? (
            <img src={outfitImage} alt="Outfit input" />
          ) : (
            <div className="preview-placeholder">Upload outfit image to preview here.</div>
          )}
        </article>

        <article className="result-card">
          <h3>Generated 3D Style Look</h3>
          {generatedImage ? (
            <img src={generatedImage} alt="Generated avatar outfit result" />
          ) : (
            <div className="preview-placeholder">Run try-on to generate result.</div>
          )}
        </article>
      </div>
    </section>
  );
}
