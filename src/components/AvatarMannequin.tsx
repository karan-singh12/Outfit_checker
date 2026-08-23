"use client";
import React from "react";

interface ClothingColors {
  top?: string | null;
  bottom?: string | null;
  dress?: string | null;
  outerwear?: string | null;
  shoes?: string | null;
}

interface AvatarMannequinProps {
  gender: "man" | "woman";
  clothing?: ClothingColors;
  animated?: boolean;
}

/* ─── shared skin palette ─── */
const SKIN  = "#e8c9a8";
const SKIN2 = "#d4a87a";
const SKIN3 = "#c4936a";
const HAIR_M = "#4a3728";  // dark brown – male
const HAIR_F = "#c8a060";  // honey blonde – female

export function AvatarMannequin({ gender, clothing = {}, animated = true }: AvatarMannequinProps) {
  const isFemale = gender === "woman";

  /* ── resolved garment colours ── */
  const topCol      = clothing.dress ?? clothing.top      ?? (isFemale ? "#e8d5f0" : "#4a7fa5");
  const bottomCol   = clothing.dress ?? clothing.bottom   ?? (isFemale ? "#2d2d3d" : "#1a1a2e");
  const outerCol    = clothing.outerwear ?? null;
  const shoeCol     = clothing.shoes ?? (isFemale ? "#8b6f5c" : "#2c2c2c");
  const hasDress    = !!(clothing.dress);

  /* ── body proportions – slight female adjustments ── */
  const shoulderW = isFemale ? 68 : 84;
  const waistW    = isFemale ? 46 : 60;
  const hipW      = isFemale ? 76 : 68;
  const legGap    = isFemale ? 8  : 10;
  const legW      = isFemale ? 24 : 26;
  const bustW     = isFemale ? 74 : 80;

  return (
    <svg
      viewBox="0 0 260 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        height: "100%",
        maxHeight: 560,
        filter: "drop-shadow(0 28px 40px rgba(0,0,0,0.55))",
        animation: animated ? "avatarBob 4s ease-in-out infinite" : undefined,
        overflow: "visible",
      }}
    >
      <defs>
        {/* ── skin gradients ── */}
        <radialGradient id="skinHead" cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stopColor={SKIN} />
          <stop offset="70%"  stopColor={SKIN2} />
          <stop offset="100%" stopColor={SKIN3} />
        </radialGradient>
        <linearGradient id="skinBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={SKIN3} stopOpacity="0.9" />
          <stop offset="30%"  stopColor={SKIN} />
          <stop offset="70%"  stopColor={SKIN} />
          <stop offset="100%" stopColor={SKIN3} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="skinArm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={SKIN3} />
          <stop offset="50%"  stopColor={SKIN} />
          <stop offset="100%" stopColor={SKIN3} />
        </linearGradient>
        <linearGradient id="skinLeg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={SKIN3} />
          <stop offset="40%"  stopColor={SKIN} />
          <stop offset="100%" stopColor={SKIN3} />
        </linearGradient>

        {/* ── clothing gradients ── */}
        <linearGradient id="topGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={topCol} stopOpacity="1" />
          <stop offset="100%" stopColor={topCol} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="bottomGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={bottomCol} stopOpacity="1" />
          <stop offset="100%" stopColor={bottomCol} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="shoeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={shoeCol} />
          <stop offset="100%" stopColor={shoeCol} stopOpacity="0.7" />
        </linearGradient>
        {outerCol && (
          <linearGradient id="outerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={outerCol} stopOpacity="0.9" />
            <stop offset="100%" stopColor={outerCol} stopOpacity="0.65" />
          </linearGradient>
        )}

        {/* ── hair ── */}
        <radialGradient id="hairGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%"   stopColor={isFemale ? "#e0b870" : "#6b5040"} />
          <stop offset="100%" stopColor={isFemale ? HAIR_F : HAIR_M} />
        </radialGradient>

        {/* ── subtle body shadow filter ── */}
        <filter id="bodyBlur" x="-20%" y="-10%" width="140%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>

      {/* ════════════════════════════ LEGS ════════════════════════════ */}
      <g filter="url(#softShadow)">
        {hasDress ? (
          /* ── Dress skirt covering legs ── */
          <>
            {/* Skirt/dress lower half */}
            <path
              d={`M ${130 - hipW/2} 310 Q ${130 - hipW/2 - 20} 400 ${130 - 30} 490
                  L ${130 + 30} 490 Q ${130 + hipW/2 + 20} 400 ${130 + hipW/2} 310 Z`}
              fill="url(#bottomGrad)"
            />
            {/* Feet peeking out */}
            {/* Left foot */}
            <ellipse cx={110} cy={492} rx={16} ry={7} fill="url(#shoeGrad)" />
            <rect x={96} y={484} width={32} height={12} rx={6} fill="url(#shoeGrad)" />
            {/* Right foot */}
            <ellipse cx={152} cy={492} rx={16} ry={7} fill="url(#shoeGrad)" />
            <rect x={138} y={484} width={32} height={12} rx={6} fill="url(#shoeGrad)" />
          </>
        ) : (
          /* ── Trousers / pants ── */
          <>
            {/* Left leg */}
            <rect
              x={130 - legGap/2 - legW}
              y={310}
              width={legW}
              height={160}
              rx={legW/2}
              fill="url(#bottomGrad)"
            />
            {/* Right leg */}
            <rect
              x={130 + legGap/2}
              y={310}
              width={legW}
              height={160}
              rx={legW/2}
              fill="url(#bottomGrad)"
            />
            {/* Crotch join */}
            <path
              d={`M ${130 - legGap/2 - legW} 340 Q 130 355 ${130 + legGap/2 + legW} 340`}
              fill="url(#bottomGrad)"
            />

            {/* Left shoe */}
            <rect x={130 - legGap/2 - legW - 4} y={462} width={legW + 8} height={14} rx={7} fill="url(#shoeGrad)" />
            <ellipse cx={130 - legGap/2 - legW/2} cy={476} rx={legW/2 + 4} ry={6} fill="url(#shoeGrad)" />
            {/* Right shoe */}
            <rect x={130 + legGap/2 - 4} y={462} width={legW + 8} height={14} rx={7} fill="url(#shoeGrad)" />
            <ellipse cx={130 + legGap/2 + legW/2} cy={476} rx={legW/2 + 4} ry={6} fill="url(#shoeGrad)" />
          </>
        )}
      </g>

      {/* ════════════════════════════ TORSO — SHIRT/TOP ════════════════ */}
      <g filter="url(#softShadow)">
        {/* Shirt body */}
        <path
          d={`M ${130 - shoulderW/2} 185
              L ${130 - waistW/2 - (hasDress ? 8 : 0)} ${hasDress ? 320 : 315}
              L ${130 + waistW/2 + (hasDress ? 8 : 0)} ${hasDress ? 320 : 315}
              L ${130 + shoulderW/2} 185 Z`}
          fill="url(#topGrad)"
        />
        {/* Shirt collar V-neck shape */}
        <path
          d={`M ${130 - 14} 185 L 130 210 L ${130 + 14} 185`}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1.5"
        />
        {/* Shirt chest highlight */}
        <ellipse cx={130} cy={230} rx={20} ry={30} fill="rgba(255,255,255,0.06)" />

        {/* Female bust shaping */}
        {isFemale && !hasDress && (
          <>
            <ellipse cx={113} cy={225} rx={14} ry={12} fill="rgba(255,255,255,0.05)" />
            <ellipse cx={147} cy={225} rx={14} ry={12} fill="rgba(255,255,255,0.05)" />
          </>
        )}

        {/* Outerwear / jacket overlay */}
        {outerCol && (
          <path
            d={`M ${130 - shoulderW/2 - 4} 185
                L ${130 - shoulderW/2 - 4} 270
                L ${130 - waistW/2 - 6} 315
                L ${130 - 8} 315 L ${130 - 8} 185 Z`}
            fill="url(#outerGrad)"
            opacity={0.9}
          />
        )}
        {outerCol && (
          <path
            d={`M ${130 + shoulderW/2 + 4} 185
                L ${130 + shoulderW/2 + 4} 270
                L ${130 + waistW/2 + 6} 315
                L ${130 + 8} 315 L ${130 + 8} 185 Z`}
            fill="url(#outerGrad)"
            opacity={0.9}
          />
        )}
      </g>

      {/* ════════════════════════════ ARMS ════════════════════════════ */}
      <g filter="url(#softShadow)">
        {/* Left upper arm */}
        <rect
          x={130 - shoulderW/2 - 18}
          y={185}
          width={20}
          height={isFemale ? 90 : 95}
          rx={10}
          fill="url(#skinArm)"
        />
        {/* Left forearm */}
        <rect
          x={130 - shoulderW/2 - 16}
          y={isFemale ? 273 : 278}
          width={16}
          height={isFemale ? 72 : 75}
          rx={8}
          fill="url(#skinArm)"
        />
        {/* Left hand */}
        <ellipse cx={130 - shoulderW/2 - 8} cy={isFemale ? 350 : 357} rx={10} ry={13} fill="url(#skinArm)" />

        {/* Right upper arm */}
        <rect
          x={130 + shoulderW/2 - 2}
          y={185}
          width={20}
          height={isFemale ? 90 : 95}
          rx={10}
          fill="url(#skinArm)"
        />
        {/* Right forearm */}
        <rect
          x={130 + shoulderW/2}
          y={isFemale ? 273 : 278}
          width={16}
          height={isFemale ? 72 : 75}
          rx={8}
          fill="url(#skinArm)"
        />
        {/* Right hand */}
        <ellipse cx={130 + shoulderW/2 + 8} cy={isFemale ? 350 : 357} rx={10} ry={13} fill="url(#skinArm)" />
      </g>

      {/* ════════════════════════════ NECK ════════════════════════════ */}
      <rect
        x={123} y={155} width={14} height={34}
        rx={7}
        fill="url(#skinBody)"
      />

      {/* ════════════════════════════ HEAD ════════════════════════════ */}
      <g>
        {/* Hair back layer */}
        {isFemale ? (
          /* Female – longer flowing hair */
          <ellipse cx={130} cy={108} rx={46} ry={52} fill="url(#hairGrad)" />
        ) : (
          /* Male – short close-cropped */
          <ellipse cx={130} cy={107} rx={41} ry={44} fill="url(#hairGrad)" />
        )}

        {/* Face / skin oval */}
        <ellipse cx={130} cy={115} rx={36} ry={40} fill="url(#skinHead)" />

        {/* Hair front – fringe */}
        {isFemale ? (
          <path
            d={`M 94 108 Q 96 80 130 78 Q 164 80 166 108
                Q 156 95 143 98 Q 130 88 117 98 Q 104 95 94 108 Z`}
            fill="url(#hairGrad)"
          />
        ) : (
          <path
            d={`M 92 112 Q 93 82 130 80 Q 167 82 168 112
                Q 158 98 145 100 Q 130 90 115 100 Q 102 98 92 112 Z`}
            fill="url(#hairGrad)"
          />
        )}

        {/* ── Eyes ── */}
        {/* Left eye white */}
        <ellipse cx={118} cy={112} rx={7} ry={5.5} fill="white" />
        {/* Left iris */}
        <ellipse cx={118} cy={113} rx={4.5} ry={4} fill={isFemale ? "#6b4c3b" : "#3b5278"} />
        {/* Left pupil */}
        <ellipse cx={118} cy={113} rx={2.5} ry={2.5} fill="#1a1a1a" />
        {/* Left highlight */}
        <ellipse cx={119.5} cy={111.5} rx={1.2} ry={1} fill="rgba(255,255,255,0.85)" />

        {/* Right eye white */}
        <ellipse cx={142} cy={112} rx={7} ry={5.5} fill="white" />
        {/* Right iris */}
        <ellipse cx={142} cy={113} rx={4.5} ry={4} fill={isFemale ? "#6b4c3b" : "#3b5278"} />
        {/* Right pupil */}
        <ellipse cx={142} cy={113} rx={2.5} ry={2.5} fill="#1a1a1a" />
        {/* Right highlight */}
        <ellipse cx={143.5} cy={111.5} rx={1.2} ry={1} fill="rgba(255,255,255,0.85)" />

        {/* Eyebrows */}
        <path d="M 112 106 Q 118 103 124 106" stroke={isFemale ? HAIR_F : HAIR_M} strokeWidth={isFemale ? 1.5 : 2} fill="none" strokeLinecap="round"/>
        <path d="M 136 106 Q 142 103 148 106" stroke={isFemale ? HAIR_F : HAIR_M} strokeWidth={isFemale ? 1.5 : 2} fill="none" strokeLinecap="round"/>

        {/* Nose */}
        <path d="M 130 116 Q 127 124 130 126 Q 133 124 130 116" fill="none" stroke={SKIN3} strokeWidth="1.2" strokeLinecap="round"/>
        {/* Nostrils */}
        <ellipse cx={127.5} cy={126} rx={2} ry={1.2} fill={SKIN3} opacity={0.5} />
        <ellipse cx={132.5} cy={126} rx={2} ry={1.2} fill={SKIN3} opacity={0.5} />

        {/* Lips */}
        {isFemale ? (
          <>
            {/* Upper lip */}
            <path d="M 122 132 Q 126 129 130 131 Q 134 129 138 132 Q 134 134 130 133 Q 126 134 122 132 Z" fill="#c07070" opacity={0.85} />
            {/* Lower lip */}
            <path d="M 122 132 Q 130 138 138 132 Q 134 136 130 137 Q 126 136 122 132 Z" fill="#c07070" opacity={0.75} />
          </>
        ) : (
          <>
            <path d="M 123 132 Q 130 130 137 132 Q 134 135 130 135 Q 126 135 123 132 Z" fill={SKIN3} opacity={0.6} />
            <path d="M 123 132 Q 130 136 137 132" fill="none" stroke={SKIN3} strokeWidth="1" opacity={0.5} />
          </>
        )}

        {/* Ears */}
        <ellipse cx={94} cy={116} rx={5} ry={7} fill={SKIN2} />
        <ellipse cx={94} cy={116} rx={3} ry={4.5} fill={SKIN3} opacity={0.5}/>
        <ellipse cx={166} cy={116} rx={5} ry={7} fill={SKIN2} />
        <ellipse cx={166} cy={116} rx={3} ry={4.5} fill={SKIN3} opacity={0.5}/>

        {/* Female earring */}
        {isFemale && (
          <>
            <circle cx={94} cy={124} r={3} fill="#f0d060" />
            <circle cx={166} cy={124} r={3} fill="#f0d060" />
          </>
        )}

        {/* Male chin / jaw shading */}
        {!isFemale && (
          <ellipse cx={130} cy={148} rx={28} ry={8} fill={SKIN3} opacity={0.25} />
        )}

        {/* Cheek blush */}
        {isFemale && (
          <>
            <ellipse cx={109} cy={124} rx={8} ry={5} fill="rgba(220,100,100,0.13)" />
            <ellipse cx={151} cy={124} rx={8} ry={5} fill="rgba(220,100,100,0.13)" />
          </>
        )}
      </g>

      {/* ════════════════════════════ GROUND SHADOW ═══════════════════ */}
      <ellipse cx={130} cy={498} rx={55} ry={10} fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}
