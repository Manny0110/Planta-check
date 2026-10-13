import React, { useId } from "react";

/** Silla plástica blanca tipo "monobloc", vista frontal. Proporción 220 × 320. */
export const Silla: React.FC<{ ancho: number; style?: React.CSSProperties }> = ({ ancho, style }) => {
  const id = useId().replace(/:/g, "");
  const plastico = `plastico-${id}`;
  const sombraPlastico = `sombraPlastico-${id}`;
  const sombraPiso = `sombraPiso-${id}`;

  return (
    <svg viewBox="0 0 220 320" width={ancho} height={(ancho * 320) / 220} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={plastico} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#F1F3F7" />
          <stop offset="1" stopColor="#D6DCE5" />
        </linearGradient>
        <linearGradient id={sombraPlastico} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9DEE6" />
          <stop offset="1" stopColor="#AEB7C4" />
        </linearGradient>
        <radialGradient id={sombraPiso}>
          <stop offset="0" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="110" cy="306" rx="100" ry="14" fill={`url(#${sombraPiso})`} />

      {/* patas traseras */}
      <path d="M58 190 L46 300" stroke={`url(#${sombraPlastico})`} strokeWidth="13" strokeLinecap="round" />
      <path d="M162 190 L174 300" stroke={`url(#${sombraPlastico})`} strokeWidth="13" strokeLinecap="round" />

      {/* respaldo */}
      <path d="M44 44 Q110 6 176 44 L166 182 Q110 170 54 182 Z" fill={`url(#${plastico})`} stroke="#C3CAD5" strokeWidth="2" />
      <path d="M56 50 Q110 20 164 50" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={70 + i * 22} y={62} width={11} height={92} rx={5.5} fill="#C9D0DA" opacity={0.85} />
      ))}

      {/* asiento */}
      <path d="M26 186 Q110 166 194 186 L204 214 Q110 232 16 214 Z" fill={`url(#${plastico})`} stroke="#C3CAD5" strokeWidth="2" />
      <path d="M16 214 Q110 232 204 214 L202 224 Q110 242 18 224 Z" fill={`url(#${sombraPlastico})`} />

      {/* patas delanteras */}
      <path d="M34 220 L22 306" stroke={`url(#${plastico})`} strokeWidth="17" strokeLinecap="round" />
      <path d="M186 220 L198 306" stroke={`url(#${plastico})`} strokeWidth="17" strokeLinecap="round" />
      <path d="M30 228 L21 300" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
};
