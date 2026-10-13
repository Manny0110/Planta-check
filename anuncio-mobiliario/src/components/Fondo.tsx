import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { colores } from "../styles/theme";

/** Partículas doradas discretas que flotan hacia arriba (deterministas: usan random() con semilla). */
export const Particulas: React.FC<{ cantidad?: number; semilla?: string; opacidad?: number }> = ({
  cantidad = 26,
  semilla = "p",
  opacidad = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacidad }}>
      {Array.from({ length: cantidad }).map((_, i) => {
        const r = (n: string) => random(`${semilla}-${n}-${i}`);
        const tamano = 4 + r("t") * 9;
        const velocidad = 0.6 + r("v") * 1.6;
        const y = ((r("y") * 2100 - frame * velocidad) % 2100 + 2100) % 2100 - 90;
        const x = r("x") * 1080 + Math.sin(frame / (30 + r("w") * 40) + r("f") * 6.28) * 24;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: tamano,
              height: tamano,
              borderRadius: "50%",
              background: r("c") > 0.3 ? colores.dorado : colores.blanco,
              boxShadow: `0 0 ${tamano * 2.5}px ${colores.dorado}`,
              opacity: 0.25 + r("o") * 0.5,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Fondo de marca continuo bajo todas las escenas: da continuidad visual entre cortes. */
export const FondoMarca: React.FC = () => {
  const frame = useCurrentFrame();
  const giro = frame * 0.05;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, ${colores.azulMedio} 0%, ${colores.azulMarino} 45%, ${colores.azulProfundo} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${giro}deg at 50% 40%, rgba(245,196,81,0.0), rgba(245,196,81,0.07), rgba(245,196,81,0.0), rgba(255,255,255,0.05), rgba(245,196,81,0.0))`,
        }}
      />
      <Particulas cantidad={18} semilla="fondo" opacidad={0.6} />
    </AbsoluteFill>
  );
};

/** Escenario de producto: foco de luz, piso con reflejo y halo dorado. */
export const Escenario: React.FC<{ yPiso?: number }> = ({ yPiso = 1010 }) => {
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 380,
          height: 900,
          background: "radial-gradient(ellipse 45% 45% at 50% 50%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: yPiso - 70,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(245,196,81,0.28) 0%, rgba(245,196,81,0.06) 55%, rgba(245,196,81,0) 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: yPiso,
          bottom: 0,
          background: "linear-gradient(180deg, rgba(6,16,28,0) 0%, rgba(6,16,28,0.55) 40%, rgba(6,16,28,0.85) 100%)",
        }}
      />
      {/* piso brillante en perspectiva: da profundidad a la parte inferior */}
      <svg width={1080} height={1920 - yPiso} style={{ position: "absolute", left: 0, top: yPiso }} viewBox={`0 0 1080 ${1920 - yPiso}`}>
        <defs>
          <linearGradient id="desvanecerPiso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F5C451" stopOpacity="0.35" />
            <stop offset="1" stopColor="#F5C451" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 13 }).map((_, i) => {
          const xBase = -900 + i * 240;
          return <line key={`v${i}`} x1={540 + (xBase - 540) * 0.12} y1={0} x2={xBase} y2={1920 - yPiso} stroke="url(#desvanecerPiso)" strokeWidth={2} />;
        })}
        {[0.06, 0.16, 0.3, 0.5, 0.78].map((t) => (
          <line key={`h${t}`} x1={0} x2={1080} y1={t * (1920 - yPiso)} y2={t * (1920 - yPiso)} stroke="#F5C451" strokeOpacity={0.22 * (1 - t)} strokeWidth={2} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
