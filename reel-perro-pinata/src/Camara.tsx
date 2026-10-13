import React, { useId } from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Entrada } from "./linea";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Intensidad de un golpe: 1 en el fotograma del golpe y cae rápido. */
const impacto = (frame: number, golpes: number[], caida = 5) =>
  golpes.reduce((max, g) => (frame >= g ? Math.max(max, Math.exp(-(frame - g) / caida)) : max), 0);

type Props = {
  children: React.ReactNode;
  frames: number;
  entrada: Entrada;
  golpes: number[];
  zoom: [number, number];
  foco: [number, number];
  semilla: string;
};

/**
 * Cámara virtual: zoom continuo, zoom punch + sacudida + separación RGB en cada golpe,
 * y el efecto de entrada del segmento (flash, glitch, zoom con desenfoque, barrido).
 */
export const Camara: React.FC<Props> = ({ children, frames, entrada, golpes, zoom, foco, semilla }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const DUR_ENTRADA = 7;
  const e = interpolate(frame, [0, DUR_ENTRADA], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  const golpe = impacto(frame, golpes);
  const zoomBase = interpolate(frame, [0, frames], zoom, { ...clamp, easing: Easing.inOut(Easing.sin) });
  const zoomEntrada = entrada === "zoomblur" ? 1 + e * 0.35 : entrada === "flash" ? 1 + e * 0.12 : entrada === "barrido" ? 1 + e * 0.4 : 1;
  const escala = zoomBase * zoomEntrada * (1 + golpe * 0.09);

  const sacudida = golpe * 22 + (entrada === "glitch" ? e * 30 : 0) + (entrada === "flash" ? e * 14 : 0);
  const sx = (random(`${semilla}-x-${frame}`) - 0.5) * 2 * sacudida;
  const sy = (random(`${semilla}-y-${frame}`) - 0.5) * 2 * sacudida;
  const giro = (random(`${semilla}-r-${frame}`) - 0.5) * golpe * 2.5;

  // barrido de arriba hacia abajo; el zoom extra de la entrada cubre el borde superior
  const barridoY = entrada === "barrido" ? interpolate(e, [0, 1], [0, 14]) : 0;
  const desenfoqueY = entrada === "barrido" ? e * 60 : 0;
  const desenfoqueZoom = entrada === "zoomblur" ? e * 10 : 0;
  const rgb = golpe * 16 + (entrada === "glitch" ? e * 34 : 0) + (entrada === "zoomblur" ? e * 12 : 0);

  const conFiltro = rgb > 0.3 || desenfoqueY > 0.3 || desenfoqueZoom > 0.3;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      {conFiltro ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={`fx-${id}`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${desenfoqueZoom} ${desenfoqueY + desenfoqueZoom}`} result="b" />
            <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feOffset in="r" dx={rgb} dy={rgb * 0.25} result="ro" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bl" />
            <feOffset in="bl" dx={-rgb} dy={-rgb * 0.25} result="bo" />
            <feBlend in="ro" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="bo" mode="screen" />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill
        style={{
          scale: String(escala),
          translate: `${sx}px ${sy + barridoY * 19.2}px`,
          rotate: `${giro}deg`,
          transformOrigin: `${foco[0]}% ${foco[1]}%`,
          filter: conFiltro ? `url(#fx-${id})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* destello blanco de entrada */}
      {entrada === "flash" ? <AbsoluteFill style={{ backgroundColor: "white", opacity: e * e }} /> : null}
      {/* franjas de glitch */}
      {entrada === "glitch" && e > 0.05
        ? Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${random(`${semilla}-g-${i}-${frame}`) * 95}%`,
                height: 20 + random(`${semilla}-h-${i}-${frame}`) * 90,
                background: i % 2 ? "rgba(0,255,240,0.35)" : "rgba(255,0,90,0.35)",
                translate: `${(random(`${semilla}-o-${i}-${frame}`) - 0.5) * 160 * e}px 0px`,
                mixBlendMode: "screen",
                opacity: e,
              }}
            />
          ))
        : null}
      {/* destello cálido (light leak) en los golpes fuertes */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 70% 50% at 85% 15%, rgba(255,170,60,0.55) 0%, rgba(255,90,40,0) 70%)",
          mixBlendMode: "screen",
          opacity: Math.max(golpe * 0.6, entrada === "flash" ? e * 0.8 : 0),
        }}
      />
    </AbsoluteFill>
  );
};
