"use client";

import { useId } from "react";

export type TacticalCharacterVariant = "male" | "female";

type TacticalCharacterProps = {
  variant: TacticalCharacterVariant;
  className?: string;
  title?: string;
};

/**
 * Stylized human tactical operator (SVG) — original art (not affiliated with any game IP).
 */
export default function TacticalCharacter({
  variant,
  className = "",
  title = "Tactical operator character",
}: TacticalCharacterProps) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${n}_${uid}`;

  if (variant === "male") {
    return (
      <svg
        className={className}
        viewBox="0 0 200 292"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id={g("bg")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e2840" />
            <stop offset="100%" stopColor="#0f1422" />
          </linearGradient>
          <linearGradient id={g("skin")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#deb895" />
            <stop offset="100%" stopColor="#c49a6c" />
          </linearGradient>
          <linearGradient id={g("pants")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a4f3a" />
            <stop offset="100%" stopColor="#2f3428" />
          </linearGradient>
        </defs>
        <rect width="200" height="292" rx="12" fill={`url(#${g("bg")})`} />
        <ellipse cx="100" cy="268" rx="58" ry="10" fill="#000" opacity="0.32" />

        <path
          d="M78 178c-2 0-8 4-10 12l-8 68c-1 6 4 12 14 12h12c6 0 10-4 11-10l6-62c0-8-6-14-15-14h-10z"
          fill={`url(#${g("pants")})`}
          stroke="#232820"
          strokeWidth="1.2"
        />
        <path
          d="M122 178c2 0 8 4 10 12l8 68c1 6-4 12-14 12h-12c-6 0-10-4-11-10l-6-62c0-8 6-14 15-14h10z"
          fill={`url(#${g("pants")})`}
          stroke="#232820"
          strokeWidth="1.2"
        />
        <path
          d="M82 218c4 3 14 3 18 0"
          stroke="#1a1e14"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M112 218c4 3 14 3 18 0"
          stroke="#1a1e14"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M62 256h28c4 0 8 3 9 8l3 14c1 4-2 8-8 8H65c-6 0-9-5-8-11l4-15c2-2 5-4 9-4z"
          fill="#2a2420"
          stroke="#151210"
          strokeWidth="1"
        />
        <path
          d="M110 256h28c4 0 8 3 9 8l3 14c1 4-2 8-8 8h-29c-6 0-9-5-8-11l4-15c2-2 5-4 9-4z"
          fill="#2a2420"
          stroke="#151210"
          strokeWidth="1"
        />

        <path
          d="M52 118c-6 2-12 10-14 22l-6 44c-2 8 6 14 14 12l4-1c5-2 9-8 10-15l7-40c1-8-2-16-8-20-4-3-9-4-14-2z"
          fill="#3a4538"
          stroke="#2a3228"
          strokeWidth="1"
        />
        <path
          d="M148 118c6 2 12 10 14 22l6 44c2 8-6 14-14 12l-4-1c-5-2-9-8-10-15l-7-40c-1-8 2-16 8-20 4-3 9-4 14-2z"
          fill="#3a4538"
          stroke="#2a3228"
          strokeWidth="1"
        />
        <ellipse
          cx="46"
          cy="202"
          rx="8"
          ry="9"
          fill={`url(#${g("skin")})`}
          stroke="#a07a52"
          strokeWidth="0.8"
        />
        <ellipse
          cx="154"
          cy="202"
          rx="8"
          ry="9"
          fill={`url(#${g("skin")})`}
          stroke="#a07a52"
          strokeWidth="0.8"
        />

        <path
          d="M72 112c12-4 28-6 44-6s32 2 44 6c6 8 8 18 8 32v38c0 14-8 26-20 32-8 4-20 6-32 6s-24-2-32-6c-12-6-20-18-20-32v-38c0-14 2-24 8-32z"
          fill="#3d4840"
          stroke="#2a332c"
          strokeWidth="1.2"
        />
        <path
          d="M74 120c10-3 42-3 52 0 4 6 6 34 4 48-8 4-24 6-38 6s-30-2-38-6c-2-14 0-42 4-48z"
          fill="#3d4a42"
          stroke="#2a3830"
          strokeWidth="1"
        />
        <path d="M82 132h36v3H82z" fill="#c9a227" opacity="0.65" />
        <rect x="92" y="140" width="16" height="20" rx="2" fill="#2a322c" opacity="0.9" />

        <path
          d="M88 94c8-2 16-2 24 0v22c-8 3-16 3-24 0V94z"
          fill={`url(#${g("skin")})`}
          stroke="#b08860"
          strokeWidth="0.8"
        />
        <ellipse
          cx="100"
          cy="72"
          rx="26"
          ry="30"
          fill={`url(#${g("skin")})`}
          stroke="#b08860"
          strokeWidth="1"
        />
        <path
          d="M74 64c4-12 14-22 26-24s26 8 30 22c-8-6-18-8-28-8s-22 4-28 10z"
          fill="#2c241c"
        />
        <path
          d="M126 64c-4-12-14-22-26-24s-26 8-30 22c8-6 18-8 28-8s22 4 28 10z"
          fill="#2c241c"
        />
        <ellipse cx="90" cy="70" rx="3.5" ry="4" fill="#2a2418" />
        <ellipse cx="110" cy="70" rx="3.5" ry="4" fill="#2a2418" />
        <path
          d="M96 80c2 2 6 2 8 0"
          stroke="#8b6a4a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <path
          d="M72 48c0-8 12-16 28-16s28 8 28 16v8c-8-6-18-10-28-10s-20 4-28 10V48z"
          fill="#353c3a"
          stroke="#222"
          strokeWidth="1"
        />
        <path d="M68 58h64v6c-10 6-22 8-32 8s-22-2-32-8v-6z" fill="#2a302e" />
        <circle cx="100" cy="100" r="72" fill="#fff" opacity="0.03" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 200 292"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={g("fbg")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2040" />
          <stop offset="100%" stopColor="#120a24" />
        </linearGradient>
        <linearGradient id={g("fskin")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8c4a8" />
          <stop offset="100%" stopColor="#d4a574" />
        </linearGradient>
        <linearGradient id={g("fhair")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5c3d2e" />
          <stop offset="100%" stopColor="#3d281c" />
        </linearGradient>
        <linearGradient id={g("fpants")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3c4a" />
          <stop offset="100%" stopColor="#302830" />
        </linearGradient>
      </defs>
      <rect width="200" height="292" rx="12" fill={`url(#${g("fbg")})`} />
      <ellipse cx="100" cy="268" rx="52" ry="9" fill="#000" opacity="0.32" />

      <path
        d="M128 52c18 8 28 32 26 58l-4 48c-4-12-12-22-24-28l6-78h-4z"
        fill={`url(#${g("fhair")})`}
        stroke="#2a1c14"
        strokeWidth="0.8"
      />

      <path
        d="M80 182c-2 0-8 4-10 12l-8 66c-1 6 4 12 12 12h10c5 0 9-4 10-10l6-60c0-8-6-14-14-14h-6z"
        fill={`url(#${g("fpants")})`}
        stroke="#241c24"
        strokeWidth="1.2"
      />
      <path
        d="M120 182c2 0 8 4 10 12l8 66c1 6-4 12-12 12h-10c-5 0-9-4-10-10l-6-60c0-8 6-14 14-14h6z"
        fill={`url(#${g("fpants")})`}
        stroke="#241c24"
        strokeWidth="1.2"
      />
      <path
        d="M84 220c4 2 12 2 16 0"
        stroke="#1a1418"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M116 220c4 2 12 2 16 0"
        stroke="#1a1418"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.45"
      />

      <path
        d="M54 120c-5 3-11 12-12 22l-5 42c-1 7 5 12 12 11h2c4-1 7-6 8-11l6-38c1-8-1-14-6-18-4-3-9-4-14-4z"
        fill="#454050"
        stroke="#302834"
      />
      <path
        d="M146 120c5 3 11 12 12 22l5 42c1 7-5 12-12 11h-2c-4-1-7-6-8-11l-6-38c-1-8 1-14 6-18 4-3 9-4 14-4z"
        fill="#454050"
        stroke="#302834"
      />
      <ellipse
        cx="48"
        cy="204"
        rx="7"
        ry="8.5"
        fill={`url(#${g("fskin")})`}
        stroke="#c49a72"
        strokeWidth="0.8"
      />
      <ellipse
        cx="152"
        cy="204"
        rx="7"
        ry="8.5"
        fill={`url(#${g("fskin")})`}
        stroke="#c49a72"
        strokeWidth="0.8"
      />

      <path
        d="M78 114c10-4 24-5 36-5s26 1 36 5c5 7 7 16 7 30v36c0 13-7 24-18 30-6 4-16 6-25 6s-19-2-25-6c-11-6-18-17-18-30v-36c0-14 2-23 7-30z"
        fill="#443c48"
        stroke="#2c2430"
      />
      <path
        d="M80 122c8-2 32-2 40 0 3 5 5 28 4 40-6 3-18 5-28 5s-22-2-28-5c-1-12 1-35 4-40z"
        fill="#3a3442"
        stroke="#282230"
      />

      <path
        d="M90 96c6-2 14-2 20 0v20c-10 2-20 2-30 0V96z"
        fill={`url(#${g("fskin")})`}
        stroke="#c49a72"
        strokeWidth="0.75"
      />
      <ellipse
        cx="100"
        cy="72"
        rx="23"
        ry="28"
        fill={`url(#${g("fskin")})`}
        stroke="#c49a72"
        strokeWidth="1"
      />
      <path
        d="M76 58c6-14 16-22 24-22s18 8 24 22c-6-4-14-6-24-6s-18 2-24 6z"
        fill={`url(#${g("fhair")})`}
      />
      <ellipse cx="92" cy="70" rx="3" ry="3.8" fill="#2a2020" />
      <ellipse cx="108" cy="70" rx="3" ry="3.8" fill="#2a2020" />
      <path
        d="M74 50c0-7 11-14 26-14s26 7 26 14v6c-8-5-17-8-26-8s-18 3-26 8v-6z"
        fill="#3c3644"
        stroke="#241c2c"
      />
      <circle cx="100" cy="105" r="68" fill="#fff" opacity="0.025" />
    </svg>
  );
}

