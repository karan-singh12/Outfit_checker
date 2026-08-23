"use client";

import type { ChangeEvent } from "react";

type OutfitUploaderProps = {
  selfiePreviewUrl: string | null;
  outfitPreviewUrl: string | null;
  onSelfieSelect: (file: File | null) => void;
  onOutfitSelect: (file: File | null) => void;
};

type UploadCardProps = {
  title: string;
  helper: string;
  inputId: string;
  previewUrl: string | null;
  emptyLabel: string;
  onSelect: (file: File | null) => void;
};

function UploadCard({
  title,
  helper,
  inputId,
  previewUrl,
  emptyLabel,
  onSelect,
}: UploadCardProps) {
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onSelect(nextFile);
  };

  return (
    <article className="upload-card">
      <h3>{title}</h3>
      <p>{helper}</p>
      <label className="upload-zone" htmlFor={inputId}>
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInput}
        />
        <span>Click to upload image</span>
      </label>
      {previewUrl ? (
        <div className="preview-box">
          <img src={previewUrl} alt={`${title} preview`} />
        </div>
      ) : (
        <div className="preview-placeholder">{emptyLabel}</div>
      )}
    </article>
  );
}

export default function OutfitUploader({
  selfiePreviewUrl,
  outfitPreviewUrl,
  onSelfieSelect,
  onOutfitSelect,
}: OutfitUploaderProps) {
  return (
    <section className="panel panel-highlight">
      <h2>Upload Source Images</h2>
      <p className="panel-subtitle">
        Add your selfie and outfit image. The model maps outfit details on your selected avatar body type.
      </p>
      <div className="upload-grid">
        <UploadCard
          title="Person Selfie"
          helper="Use clear face and body framing, front angle preferred."
          inputId="selfie-upload"
          previewUrl={selfiePreviewUrl}
          emptyLabel="No selfie image selected."
          onSelect={onSelfieSelect}
        />
        <UploadCard
          title="Outfit Image"
          helper="Use outfit-only image or full look with visible clothing details."
          inputId="outfit-upload"
          previewUrl={outfitPreviewUrl}
          emptyLabel="No outfit image selected."
          onSelect={onOutfitSelect}
        />
      </div>
    </section>
  );
}
