import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colores, fuente, sombras } from "../styles/theme";

type Props = {
  precio: string;
  unidad: string;
  /** Fotograma (relativo a la escena) en que empieza a aparecer. */
  inicio: number;
  /** "aparicion": cuenta progresiva + revelado; "pop": rebote directo. */
  estilo?: "aparicion" | "pop";
  /** Para la portada: se muestra en su estado final, sin animación. */
  estatico?: boolean;
  escala?: number;
};

const desglosar = (precio: string) => {
  const coincidencia = precio.match(/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/);
  if (!coincidencia) return null;
  const [, prefijo, numero, sufijo] = coincidencia;
  const decimales = numero.includes(".") || numero.includes(",") ? numero.split(/[.,]/)[1].length : 0;
  return { prefijo, valor: parseFloat(numero.replace(",", ".")), decimales, sufijo, separador: numero.includes(",") ? "," : "." };
};

/** Tarjeta de precio destacada: entra con rebote, el número se revela y un destello la recorre. */
export const AnimatedPrice: React.FC<Props> = ({ precio, unidad, inicio, estilo = "aparicion", estatico = false, escala = 1 }) => {
  const frameReal = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = estatico ? inicio + 200 : frameReal;
  const f = frame - inicio;

  const entrada = spring({ frame: f, fps, config: estilo === "pop" ? { damping: 9, mass: 0.7, stiffness: 160 } : { damping: 13, stiffness: 140 } });
  const conteo = interpolate(f, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const destello = interpolate(f, [18, 42], [-0.4, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulso = 1 + 0.025 * Math.max(0, Math.sin(((f - 45) / fps) * Math.PI * 1.2)) * (f > 45 ? 1 : 0);
  const unidadAparece = spring({ frame: f - 12, fps, config: { damping: 12 } });

  const partes = desglosar(precio);
  let texto = precio;
  if (estilo === "aparicion" && partes && conteo < 1) {
    texto = `${partes.prefijo}${(partes.valor * conteo).toFixed(partes.decimales).replace(".", partes.separador)}${partes.sufijo}`;
  }

  return (
    <div
      style={{
        position: "relative",
        width: 860 * escala,
        padding: `${30 * escala}px ${40 * escala}px ${34 * escala}px`,
        borderRadius: 48 * escala,
        background: `linear-gradient(160deg, ${colores.blanco} 0%, ${colores.grisClaro} 100%)`,
        boxShadow: sombras.tarjeta,
        borderTop: `${10 * escala}px solid ${colores.dorado}`,
        overflow: "hidden",
        opacity: interpolate(entrada, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        scale: String(interpolate(entrada, [0, 1], [0.55, 1]) * pulso),
        translate: `0px ${interpolate(entrada, [0, 1], [70, 0])}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 28 * escala,
        fontFamily: fuente,
      }}
    >
      <div
        style={{
          fontSize: 190 * escala,
          fontWeight: 900,
          lineHeight: 1,
          color: colores.azulMarino,
          letterSpacing: -4 * escala,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {texto}
      </div>
      <div
        style={{
          fontSize: 60 * escala,
          fontWeight: 900,
          color: colores.azulMarino,
          background: `linear-gradient(135deg, #FFE29A 0%, ${colores.dorado} 55%, ${colores.doradoOscuro} 100%)`,
          borderRadius: 24 * escala,
          padding: `${12 * escala}px ${22 * escala}px`,
          boxShadow: sombras.suave,
          scale: String(unidadAparece),
          rotate: `${interpolate(unidadAparece, [0, 1], [-25, -4])}deg`,
        }}
      >
        {unidad}
      </div>
      {/* destello */}
      <div
        style={{
          position: "absolute",
          top: -100,
          bottom: -100,
          width: 140 * escala,
          left: `${destello * 100}%`,
          rotate: "20deg",
          background: "linear-gradient(90deg, rgba(245,196,81,0) 0%, rgba(245,196,81,0.38) 50%, rgba(245,196,81,0) 100%)",
          opacity: estatico ? 0 : 1,
        }}
      />
    </div>
  );
};
