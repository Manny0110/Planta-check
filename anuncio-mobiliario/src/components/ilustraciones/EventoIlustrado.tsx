import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colores } from "../../styles/theme";
import { MesaConMantel } from "./MesaConMantel";
import { Silla } from "./Silla";

type Fila = { y: number; anchoMesa: number; xs: number[]; profundidad: number; desenfoque: number; brillo: number };

const FILAS: Fila[] = [
  { y: 1090, anchoMesa: 200, xs: [80, 390, 700, 1010], profundidad: 0.25, desenfoque: 3, brillo: 0.55 },
  { y: 1230, anchoMesa: 300, xs: [-60, 400, 860], profundidad: 0.55, desenfoque: 1.5, brillo: 0.75 },
  { y: 1440, anchoMesa: 470, xs: [-120, 640], profundidad: 1, desenfoque: 0, brillo: 0.95 },
];

const Bombillas: React.FC<{ y: number; curva: number; semilla: string; frame: number }> = ({ y, curva, semilla, frame }) => {
  const n = 14;
  return (
    <svg width={1300} height={400} viewBox="0 0 1300 400" style={{ position: "absolute", left: -110, top: y, overflow: "visible" }}>
      <path d={`M0 0 Q650 ${curva * 2} 1300 0`} stroke="rgba(255,236,190,0.35)" strokeWidth="3" fill="none" />
      {Array.from({ length: n }).map((_, i) => {
        const t = (i + 0.5) / n;
        const x = t * 1300;
        const yy = 2 * (1 - t) * t * curva * 2;
        const parpadeo = 0.75 + 0.25 * Math.sin(frame / 9 + random(`${semilla}-${i}`) * 6.28);
        return (
          <g key={i} opacity={parpadeo}>
            <circle cx={x} cy={yy + 14} r={26} fill="rgba(245,196,81,0.22)" />
            <circle cx={x} cy={yy + 14} r={9} fill="#FFE7A8" />
          </g>
        );
      })}
    </svg>
  );
};

/** Salón de eventos ilustrado, en capas para simular profundidad (parallax). */
export const EventoIlustrado: React.FC<{ zoom?: number }> = ({ zoom = 1 }) => {
  const frame = useCurrentFrame();
  const deriva = interpolate(frame, [0, 600], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${colores.azulProfundo} 0%, #15304D 38%, #2A3550 58%, #1A2338 72%, #0B1626 100%)`,
        }}
      />
      {/* resplandor cálido del salón */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 70% 30% at 50% 58%, rgba(245,196,81,0.35) 0%, rgba(245,196,81,0) 70%)",
        }}
      />

      {/* bokeh lejano */}
      <AbsoluteFill style={{ translate: `${deriva * -30}px ${deriva * -20}px`, scale: String(zoom * 0.98 + 0.02) }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const r = 20 + random(`bokeh-r-${i}`) * 70;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: random(`bokeh-x-${i}`) * 1080 - r,
                top: 120 + random(`bokeh-y-${i}`) * 900 - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                background: i % 3 === 0 ? "rgba(255,255,255,0.10)" : "rgba(245,196,81,0.16)",
                filter: "blur(10px)",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* guirnaldas de luces */}
      <AbsoluteFill style={{ translate: `${deriva * -18}px 0px`, scale: String(zoom) }}>
        <Bombillas y={300} curva={110} semilla="a" frame={frame} />
        <Bombillas y={520} curva={90} semilla="b" frame={frame} />
        <Bombillas y={720} curva={70} semilla="c" frame={frame} />
      </AbsoluteFill>

      {/* piso */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1120,
          bottom: 0,
          background: "linear-gradient(180deg, rgba(43,35,40,0.0) 0%, rgba(12,20,34,0.85) 30%, #08111D 100%)",
        }}
      />

      {/* filas de mesas: cada fila se mueve distinto según su profundidad */}
      {FILAS.map((fila, f) => (
        <AbsoluteFill
          key={f}
          style={{
            translate: `${deriva * -60 * fila.profundidad}px ${deriva * -25 * fila.profundidad}px`,
            scale: String(1 + (zoom - 1) * (0.6 + fila.profundidad)),
            transformOrigin: "50% 40%",
            filter: `blur(${fila.desenfoque}px) brightness(${fila.brillo})`,
          }}
        >
          {fila.xs.map((x, i) => (
            <div key={i} style={{ position: "absolute", left: x - fila.anchoMesa / 2, top: fila.y }}>
              <Silla ancho={fila.anchoMesa * 0.36} style={{ position: "absolute", left: -fila.anchoMesa * 0.14, top: fila.anchoMesa * 0.2 }} />
              <Silla ancho={fila.anchoMesa * 0.36} style={{ position: "absolute", left: fila.anchoMesa * 0.78, top: fila.anchoMesa * 0.2 }} />
              <MesaConMantel ancho={fila.anchoMesa} style={{ position: "relative" }} />
              <Silla ancho={fila.anchoMesa * 0.4} style={{ position: "absolute", left: fila.anchoMesa * 0.3, top: fila.anchoMesa * 0.5 }} />
            </div>
          ))}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
