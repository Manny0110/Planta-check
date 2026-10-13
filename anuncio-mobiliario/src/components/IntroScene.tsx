import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { imagenes, textos } from "../config/business";
import { recursoSiExiste } from "../config/recursos";
import { colores, fuente, sombras, zonaSegura } from "../styles/theme";
import { Particulas } from "./Fondo";
import { EventoIlustrado } from "./ilustraciones/EventoIlustrado";

const TAMANOS_TITULO = [112, 184, 140];

/** ESCENA 1 — Gancho: "¿TENÉS UN EVENTO PRONTO?" sobre un salón de eventos. */
export const IntroScene: React.FC<{ duracion: number }> = ({ duracion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fotoEvento = recursoSiExiste(imagenes.evento);

  // zoom cinematográfico: "golpe" inicial y luego acercamiento lento
  const golpe = interpolate(frame, [0, 14], [1.22, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const zoomLento = interpolate(frame, [0, duracion], [1, 1.12]);

  const subtitulo = spring({ frame: frame - 26, fps, config: { damping: 14, stiffness: 120 } });
  const brilloSubtitulo = interpolate(frame, [40, 70], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: fuente }}>
      <AbsoluteFill style={{ scale: String(golpe * zoomLento) }}>
        {fotoEvento ? (
          <Img src={fotoEvento} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <EventoIlustrado zoom={1} />
        )}
      </AbsoluteFill>

      {/* velo para que el texto se lea siempre */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,28,46,0.88) 0%, rgba(10,28,46,0.55) 45%, rgba(10,28,46,0.25) 62%, rgba(10,28,46,0.75) 100%)",
        }}
      />
      <Particulas cantidad={30} semilla="intro" />

      {/* destello de impacto en el primer instante */}
      <AbsoluteFill
        style={{
          backgroundColor: colores.blanco,
          opacity: interpolate(frame, [0, 8], [0.25, 0], { extrapolateRight: "clamp" }),
        }}
      />

      <AbsoluteFill
        style={{
          paddingTop: zonaSegura.arriba + 70,
          alignItems: "center",
          paddingLeft: zonaSegura.lateral,
          paddingRight: zonaSegura.lateral,
        }}
      >
        {textos.gancho.titulo.map((linea, i) => {
          const s = spring({ frame: frame + 2 - i * 4, fps, config: { damping: 9, stiffness: 170, mass: 0.8 } });
          return (
            <div
              key={linea}
              style={{
                fontSize: TAMANOS_TITULO[i] ?? 120,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: i === 1 ? colores.dorado : colores.blanco,
                textShadow: i === 1 ? `${sombras.brilloDorado}, 0 10px 30px rgba(0,0,0,0.5)` : "0 10px 30px rgba(0,0,0,0.55)",
                scale: String(interpolate(s, [0, 1], [1.5, 1])),
                opacity: interpolate(s, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
                textAlign: "center",
              }}
            >
              {linea}
            </div>
          );
        })}

        <div
          style={{
            marginTop: 54,
            position: "relative",
            overflow: "hidden",
            padding: "26px 46px",
            borderRadius: 36,
            background: "rgba(16,42,67,0.82)",
            border: `4px solid ${colores.dorado}`,
            boxShadow: sombras.tarjeta,
            color: colores.blanco,
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.15,
            textAlign: "center",
            maxWidth: 780,
            opacity: interpolate(subtitulo, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
            translate: `0px ${interpolate(subtitulo, [0, 1], [90, 0])}px`,
            scale: String(interpolate(subtitulo, [0, 1], [0.85, 1])),
          }}
        >
          {textos.gancho.subtitulo}
          <div
            style={{
              position: "absolute",
              top: -50,
              bottom: -50,
              width: 120,
              left: `${brilloSubtitulo}%`,
              rotate: "20deg",
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
