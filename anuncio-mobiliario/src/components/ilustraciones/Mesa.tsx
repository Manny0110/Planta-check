import React, { useId } from "react";

/** Mesa plegable rectangular en perspectiva. Proporción 420 × 270. */
export const Mesa: React.FC<{ ancho: number; style?: React.CSSProperties }> = ({ ancho, style }) => {
  const id = useId().replace(/:/g, "");
  const cubierta = `cubierta-${id}`;
  const canto = `canto-${id}`;
  const sombraPiso = `sombraPisoMesa-${id}`;

  return (
    <svg viewBox="0 0 420 270" width={ancho} height={(ancho * 270) / 420} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={cubierta} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#EEF1F5" />
          <stop offset="1" stopColor="#D8DEE6" />
        </linearGradient>
        <linearGradient id={canto} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C8CFD9" />
          <stop offset="1" stopColor="#9AA4B2" />
        </linearGradient>
        <radialGradient id={sombraPiso}>
          <stop offset="0" stopColor="rgba(0,0,0,0.5)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="210" cy="258" rx="200" ry="16" fill={`url(#${sombraPiso})`} />

      {/* patas traseras */}
      <path d="M92 118 L96 226" stroke="#3E4A5A" strokeWidth="9" strokeLinecap="round" />
      <path d="M328 118 L324 226" stroke="#3E4A5A" strokeWidth="9" strokeLinecap="round" />
      <path d="M96 190 L324 190" stroke="#3E4A5A" strokeWidth="5" opacity="0.7" />

      {/* cubierta */}
      <path d="M70 66 L350 66 L404 120 L16 120 Z" fill={`url(#${cubierta})`} />
      <path d="M78 70 L342 70" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <path d="M16 120 L404 120 L404 140 L16 140 Z" fill={`url(#${canto})`} />
      <path d="M16 140 L404 140" stroke="#7D8796" strokeWidth="2" />

      {/* patas delanteras */}
      <path d="M44 140 L40 256" stroke="#2D3846" strokeWidth="12" strokeLinecap="round" />
      <path d="M376 140 L380 256" stroke="#2D3846" strokeWidth="12" strokeLinecap="round" />
      <path d="M42 150 L39 246" stroke="#7B8899" strokeWidth="3" strokeLinecap="round" />
      <path d="M378 150 L381 246" stroke="#7B8899" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
