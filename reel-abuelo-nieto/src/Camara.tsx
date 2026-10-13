import React, { useId } from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Segmento } from "./linea";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.45, 0, 0.25, 1);

/**
 * Cámara virtual sobria: zoom continuo que sigue a los protagonistas, entradas suaves
 * (fundido, zoom de paso, destello leve) y un golpe de zoom discreto en el momento clave.
 */
export const Camara: React.FC<{ seg: Segmento; frames: number; children: React.ReactNode }> = ({ seg, frames, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const id = useId().replace(/:/g, "");

  const avance = interpolate(frame, [0, frames], [0, 1], { ...clamp, easing: suave });
  const zoom = interpolate(avance, [0, 1], seg.zoom);
  const fx = interpolate(avance, [0, 1], [seg.foco[0][0], seg.foco[1][0]]) / 100;
  const fy = interpolate(avance, [0, 1], [seg.foco[0][1], seg.foco[1][1]]) / 100;

  const entradaDur = seg.entrada === "disolver" ? Math.max(1, seg.traslape) : 9;
  const e = interpolate(frame, [0, entradaDur], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  const golpe = seg.golpes.reduce((m, g) => (frame >= g ? Math.max(m, Math.exp(-(frame - g) / 7)) : m), 0);
  const escala = zoom * (seg.entrada === "zoomthrough" ? 1 + e * 0.16 : 1) * (1 + golpe * 0.05);

  // centrar el foco sin dejar bordes negros
  const maxX = ((escala - 1) * width) / 2;
  const maxY = ((escala - 1) * height) / 2;
  const tx = Math.max(-maxX, Math.min(maxX, -escala * (fx - 0.5) * width));
  const ty = Math.max(-maxY, Math.min(maxY, -escala * (fy - 0.5) * height));
  const temblor = golpe * 4;
  const sx = (random(`${seg.id}-x-${frame}`) - 0.5) * 2 * temblor;
  const sy = (random(`${seg.id}-y-${frame}`) - 0.5) * 2 * temblor;

  const desenfoque = seg.entrada === "zoomthrough" ? e * 7 : 0;
  const rebobinando = seg.tipo === "rebobinado";
  const filtros = [
    desenfoque > 0.2 ? `blur(${desenfoque}px)` : "",
    rebobinando ? `url(#movimiento-${id})` : "",
    seg.tipo === "congelado" ? "saturate(0.85) brightness(0.95)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: seg.entrada === "disolver" ? 1 - e : 1 }}>
      {rebobinando ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={`movimiento-${id}`}>
            <feGaussianBlur stdDeviation="0 9" />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill
        style={{
          scale: String(escala),
          translate: `${tx + sx}px ${ty + sy}px`,
          filter: filtros || undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {seg.tipo === "congelado" ? (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)" }} />
      ) : null}
      {seg.entrada === "flashsuave" || golpe > 0.01 ? (
        <AbsoluteFill style={{ backgroundColor: "white", opacity: Math.max(seg.entrada === "flashsuave" ? e * e * 0.55 : 0, golpe * golpe * 0.3) }} />
      ) : null}
    </AbsoluteFill>
  );
};
