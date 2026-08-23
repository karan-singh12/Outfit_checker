"use client";

type LoaderProps = {
  label?: string;
};

export default function Loader({ label = "Generating character try-on..." }: LoaderProps) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
