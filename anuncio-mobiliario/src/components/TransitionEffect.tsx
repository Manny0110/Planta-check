import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colores } from "../styles/theme";

const suave = Easing.bezier(0.65, 0, 0.35, 1);

type PropsTransicion = {
  children: React.ReactNode;
  /** Duración total de la secuencia que envuelve (fotogramas). */
  duracion: number;
  /** Fotogramas de transición. */
  transicion: number;
  entrada?: boolean;
  salida?: boolean;
  /** 1 = la escena nueva llega desde la derecha; -1 = desde la izquierda. */
  direccion?: 1 | -1;
};

/**
 * Envuelve una escena y le da entrada y salida con profundidad:
 * la escena nueva llega desde un lado y desde "más cerca" (escala mayor),
 * la saliente se aleja hacia el fondo. Ambas se superponen, sin cortes bruscos.
 */
export const TransicionEscena: React.FC<PropsTransicion> = ({
  children,
  duracion,
  transicion,
  entrada = true,
  salida = true,
  direccion = 1,
}) => {
  const frame = useCurrentFrame();
  const opciones = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave } as const;

  const p = entrada ? interpolate(frame, [0, transicion], [0, 1], opciones) : 1;
  const q = salida ? interpolate(frame, [duracion - transicion, duracion], [0, 1], opciones) : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(p, 1 - q),
        translate: `${(1 - p) * 160 * direccion - q * 160 * direccion}px 0px`,
        scale: String((1 + (1 - p) * 0.12) * (1 - q * 0.1)),
        filter: `blur(${(1 - p) * 12 + q * 10}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Destello dorado diagonal que barre la pantalla en cada cambio de escena.
 * Va en una <Sequence> centrada en el corte.
 */
export const DestelloTransicion: React.FC<{ duracion: number; direccion?: 1 | -1 }> = ({ duracion, direccion = 1 }) => {
  const frame = useCurrentFrame();
  const avance = interpolate(frame, [0, duracion], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.25, 1),
  });
  const intensidad = Math.sin(avance * Math.PI);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -600,
          height: 3100,
          width: 520,
          left: direccion === 1 ? interpolate(avance, [0, 1], [-900, 1500]) : interpolate(avance, [0, 1], [1500, -900]),
          rotate: "18deg",
          background: `linear-gradient(90deg, rgba(245,196,81,0) 0%, rgba(245,196,81,0.55) 38%, rgba(255,255,255,0.85) 50%, rgba(245,196,81,0.55) 62%, rgba(245,196,81,0) 100%)`,
          filter: "blur(24px)",
          opacity: intensidad,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: colores.dorado, opacity: intensidad * 0.08 }} />
    </AbsoluteFill>
  );
};
