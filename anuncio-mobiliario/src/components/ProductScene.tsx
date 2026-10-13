import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Producto, tiempos } from "../config/business";
import { recursoSiExiste } from "../config/recursos";
import { colores, fuente, sombras, zonaSegura } from "../styles/theme";
import { AnimatedPrice } from "./AnimatedPrice";
import { Escenario, Particulas } from "./Fondo";
import { Mesa } from "./ilustraciones/Mesa";
import { MesaConMantel } from "./ilustraciones/MesaConMantel";
import { Silla } from "./ilustraciones/Silla";

/** Zona del producto (entre el título y la tarjeta de precio). */
const ZONA = { arriba: 560, abajo: 1000 };
const Y_PRECIO = 1000;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- visual: sillas que entran desde distintas direcciones ----------
type SillaEnEscena = { x: number; y: number; ancho: number; desde: [number, number]; retraso: number; capa: number };
const SILLAS: SillaEnEscena[] = [
  { x: 190, y: 600, ancho: 170, desde: [-500, -300], retraso: 10, capa: 0 },
  { x: 890, y: 600, ancho: 170, desde: [500, -300], retraso: 12, capa: 0 },
  { x: 300, y: 610, ancho: 240, desde: [-700, 0], retraso: 6, capa: 1 },
  { x: 780, y: 610, ancho: 240, desde: [700, 0], retraso: 8, capa: 1 },
  { x: 540, y: 580, ancho: 300, desde: [0, 700], retraso: 2, capa: 2 },
];

const VisualSillas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {SILLAS.map((s, i) => {
        const e = spring({ frame: frame - s.retraso, fps, config: { damping: 15, stiffness: 110 } });
        const dolly = interpolate(frame, [0, 136], [1, 1 + 0.03 + s.capa * 0.04]);
        const flotar = Math.sin((frame + i * 11) / 16) * (3 + s.capa * 2);
        const alto = (s.ancho * 320) / 220;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x - s.ancho / 2,
              top: s.y,
              width: s.ancho,
              height: alto,
              translate: `${(1 - e) * s.desde[0]}px ${(1 - e) * s.desde[1] + flotar}px`,
              scale: String(dolly * interpolate(e, [0, 1], [0.7, 1])),
              rotate: `${(1 - e) * (s.desde[0] > 0 ? 18 : s.desde[0] < 0 ? -18 : 0)}deg`,
              opacity: interpolate(e, [0, 0.2], [0, 1], clamp),
              filter: `brightness(${0.72 + s.capa * 0.14}) blur(${(2 - s.capa) * 1.2}px) drop-shadow(0 30px 30px rgba(0,0,0,0.35))`,
              zIndex: s.capa,
            }}
          >
            <Silla ancho={s.ancho} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- visual: mesa protagonista con mesas al fondo ----------
const VisualMesas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 100 } });
  const fondo = spring({ frame: frame - 14, fps, config: { damping: 18 } });
  const deriva = interpolate(frame, [0, 136], [0, 1]);
  return (
    <AbsoluteFill>
      {[{ x: 110, desde: -1 }, { x: 650, desde: 1 }].map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: m.x,
            top: 640,
            opacity: interpolate(fondo, [0, 1], [0, 0.6]),
            translate: `${(1 - fondo) * 200 * m.desde + deriva * -20}px 0px`,
            filter: "blur(3px) brightness(0.7)",
          }}
        >
          <Mesa ancho={320} />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 540 - 380,
          top: 690,
          translate: `${(1 - e) * 520 + deriva * 24}px ${(1 - e) * 60 + Math.sin(frame / 18) * 4}px`,
          scale: String(interpolate(e, [0, 1], [0.45, 1]) * interpolate(frame, [0, 136], [1, 1.06])),
          rotate: `${(1 - e) * 10}deg`,
          opacity: interpolate(e, [0, 0.2], [0, 1], clamp),
          filter: "drop-shadow(0 40px 40px rgba(0,0,0,0.4))",
        }}
      >
        <Mesa ancho={760} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- visual: mantel que se despliega sobre la mesa ----------
const Destellos: React.FC<{ desde: number }> = ({ desde }) => {
  const frame = useCurrentFrame();
  const puntos = [
    { x: 200, y: 600 },
    { x: 880, y: 640 },
    { x: 150, y: 860 },
    { x: 930, y: 900 },
    { x: 540, y: 560 },
    { x: 320, y: 700 },
    { x: 770, y: 760 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {puntos.map((p, i) => {
        const f = frame - desde - i * 4;
        const vida = (((f % 40) + 40) % 40) / 40;
        const visible = f >= 0 ? Math.sin(vida * Math.PI) : 0;
        const tam = 34 + random(`destello-${i}`) * 30;
        return (
          <svg
            key={i}
            viewBox="-10 -10 20 20"
            width={tam}
            height={tam}
            style={{ position: "absolute", left: p.x - tam / 2, top: p.y - tam / 2, opacity: visible, scale: String(0.5 + visible * 0.7), rotate: `${f * 2}deg` }}
          >
            <path d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z" fill={i % 2 ? colores.blanco : colores.dorado} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const VisualManteles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mesa = spring({ frame: frame - 2, fps, config: { damping: 16 } });
  const despliegue = spring({ frame: frame - 12, fps, config: { damping: 11, stiffness: 70, mass: 0.9 } });
  const ondulacion = 22 * Math.max(0, 1 - despliegue) + 4 * Math.sin(frame / 7) * interpolate(frame, [12, 70], [1, 0.3], clamp);
  const brillo = interpolate(frame, [44, 74], [-0.3, 1.3], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 540 - 280,
          top: 530,
          width: 560,
          opacity: interpolate(mesa, [0, 0.3], [0, 1], clamp),
          scale: String(interpolate(mesa, [0, 1], [0.8, 1]) * interpolate(frame, [0, 136], [1, 1.05])),
          translate: `${interpolate(mesa, [0, 1], [-300, 0])}px 0px`,
          filter: "drop-shadow(0 40px 40px rgba(0,0,0,0.4))",
          overflow: "visible",
        }}
      >
        <MesaConMantel ancho={560} despliegue={despliegue} ondulacion={ondulacion} fase={frame / 5} />
        {/* brillo que recorre la tela */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${brillo * 100 - 12}%, rgba(255,255,255,0.45) ${brillo * 100}%, rgba(255,255,255,0) ${brillo * 100 + 12}%)`,
            mixBlendMode: "overlay",
            WebkitMaskImage: "radial-gradient(ellipse 52% 50% at 50% 55%, black 60%, transparent 75%)",
          }}
        />
      </div>
      <Destellos desde={40} />
    </AbsoluteFill>
  );
};

// ---------- foto real (si el usuario la proporciona) ----------
const VisualFoto: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 100 } });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: zonaSegura.lateral - 20,
          right: zonaSegura.lateral - 20,
          top: ZONA.arriba,
          height: ZONA.abajo - ZONA.arriba + 30,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          opacity: interpolate(e, [0, 0.3], [0, 1], clamp),
          scale: String(interpolate(e, [0, 1], [0.7, 1]) * interpolate(frame, [0, 136], [1, 1.06])),
          translate: `0px ${interpolate(e, [0, 1], [120, 0]) + Math.sin(frame / 18) * 5}px`,
        }}
      >
        <Img src={src} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 40px 40px rgba(0,0,0,0.45))" }} />
      </div>
    </AbsoluteFill>
  );
};

/** ESCENAS 2–4 — Producto con título, visual en capas y precio destacado. */
export const ProductScene: React.FC<{ producto: Producto; duracion: number }> = ({ producto, duracion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const foto = recursoSiExiste(producto.imagen);

  const insignia = spring({ frame: frame - 4, fps, config: { damping: 10, stiffness: 150 } });
  const antetitulo = spring({ frame: frame - 7, fps, config: { damping: 16 } });
  const titulo = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 140 } });
  // cámara: deriva lenta para que nada quede estático; el texto se mueve menos que el producto (parallax)
  const camara = interpolate(frame, [0, duracion], [0, 1], { easing: Easing.inOut(Easing.sin) });

  const visual = foto ? (
    <VisualFoto src={foto} />
  ) : producto.id === "sillas" ? (
    <VisualSillas />
  ) : producto.id === "mesas" ? (
    <VisualMesas />
  ) : (
    <VisualManteles />
  );

  return (
    <AbsoluteFill style={{ fontFamily: fuente }}>
      <Escenario yPiso={ZONA.abajo - 40} />
      <AbsoluteFill style={{ translate: `0px ${camara * -16}px` }}>{visual}</AbsoluteFill>
      <Particulas cantidad={14} semilla={producto.id} opacidad={0.8} />

      {/* encabezado */}
      <AbsoluteFill
        style={{
          paddingTop: zonaSegura.arriba + 20,
          alignItems: "center",
          translate: `0px ${camara * -6}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #FFE29A 0%, ${colores.dorado} 55%, ${colores.doradoOscuro} 100%)`,
              boxShadow: sombras.brilloDorado,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
              scale: String(insignia),
              rotate: `${interpolate(insignia, [0, 1], [-120, 0])}deg`,
            }}
          >
            {producto.emoji}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: 4,
              color: colores.dorado,
              opacity: antetitulo,
              translate: `${interpolate(antetitulo, [0, 1], [-80, 0])}px 0px`,
            }}
          >
            {producto.antetitulo}
          </div>
        </div>
        <div style={{ overflow: "hidden", paddingBottom: 8 }}>
          <div
            style={{
              fontSize: producto.titulo.length > 6 ? 136 : 156,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: colores.blanco,
              textShadow: "0 12px 30px rgba(0,0,0,0.45)",
              translate: `0px ${interpolate(titulo, [0, 1], [170, 0])}px`,
            }}
          >
            {producto.titulo}
          </div>
        </div>
      </AbsoluteFill>

      {/* precio */}
      <AbsoluteFill style={{ top: Y_PRECIO, alignItems: "center" }}>
        <AnimatedPrice
          precio={producto.precio}
          unidad={producto.unidad}
          inicio={tiempos.aparicionPrecio}
          estilo={producto.id === "sillas" ? "aparicion" : "pop"}
          escala={0.94}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
