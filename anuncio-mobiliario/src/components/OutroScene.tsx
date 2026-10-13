import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { imagenes, marcadores, negocio, textos, tiempos } from "../config/business";
import { recursoSiExiste } from "../config/recursos";
import { colores, fuente, sombras, zonaSegura } from "../styles/theme";
import { Particulas } from "./Fondo";
import { EventoIlustrado } from "./ilustraciones/EventoIlustrado";
import { MesaConMantel } from "./ilustraciones/MesaConMantel";
import { Silla } from "./ilustraciones/Silla";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Muestra el dato del negocio, o un marcador punteado si está vacío (o nada, según la configuración). */
const DatoNegocio: React.FC<{ valor: string; marcador: string; style: React.CSSProperties }> = ({ valor, marcador, style }) => {
  if (valor.trim()) return <div style={style}>{valor}</div>;
  if (!negocio.mostrarMarcadores) return null;
  return (
    <div
      style={{
        ...style,
        color: "rgba(255,255,255,0.75)",
        border: "3px dashed rgba(245,196,81,0.8)",
        borderRadius: 18,
        padding: "8px 24px",
        fontSize: Number(style.fontSize ?? 40) * 0.8,
      }}
    >
      {marcador}
    </div>
  );
};

const IconoWhatsApp: React.FC<{ tam: number }> = ({ tam }) => (
  <svg viewBox="0 0 64 64" width={tam} height={tam}>
    <path d="M32 4C16.5 4 4 16.2 4 31.4c0 5.4 1.6 10.4 4.3 14.6L4 60l14.6-4.1c4 2.1 8.6 3.3 13.4 3.3 15.5 0 28-12.2 28-27.4S47.5 4 32 4z" fill={colores.blanco} />
    <path
      d="M24.2 18.5c-.6-1.3-1.2-1.3-1.8-1.4h-1.5c-.5 0-1.4.2-2.1 1-.7.8-2.8 2.7-2.8 6.5s2.9 7.5 3.3 8c.4.5 5.6 8.7 13.8 11.9 6.8 2.6 8.2 2.1 9.7 2 1.5-.1 4.8-1.9 5.4-3.8.7-1.9.7-3.5.5-3.8-.2-.3-.7-.5-1.5-.9s-4.8-2.3-5.5-2.6c-.7-.3-1.3-.4-1.8.4-.5.8-2.1 2.6-2.5 3.1-.5.5-.9.6-1.7.2-.8-.4-3.4-1.2-6.4-3.9-2.4-2.1-4-4.6-4.4-5.4-.5-.8 0-1.2.4-1.6.4-.4.8-.9 1.2-1.4.4-.5.5-.8.8-1.3.3-.5.1-1-.1-1.4-.2-.4-1.7-4.2-2.4-5.6z"
      fill={colores.verdeWhatsApp}
    />
  </svg>
);

/** ESCENA 5 — Cierre y conversión hacia WhatsApp. */
export const OutroScene: React.FC<{ duracion: number }> = ({ duracion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = recursoSiExiste(imagenes.logo);
  const tB = tiempos.aparicionBoton;

  const marca = spring({ frame: frame - 6, fps, config: { damping: 16 } });
  const servicios = spring({ frame: frame - 30, fps, config: { damping: 15 } });
  const transporte = spring({ frame: frame - 46, fps, config: { damping: 15 } });
  const boton = spring({ frame: frame - tB, fps, config: { damping: 8, stiffness: 160, mass: 0.8 } });
  const contacto = spring({ frame: frame - tB - 12, fps, config: { damping: 16 } });
  const latido = frame > tB + 20 ? 1 + 0.04 * Math.max(0, Math.sin(((frame - tB - 20) / fps) * Math.PI * 2.2)) : 1;
  const onda = ((frame - tB - 10) % 30) / 30;
  const muebles = spring({ frame: frame - 4, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ fontFamily: fuente }}>
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, duracion], [1.06, 1.14])) }}>
        <EventoIlustrado zoom={1.04} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,28,46,0.94) 0%, rgba(10,28,46,0.9) 55%, rgba(10,28,46,0.55) 72%, rgba(10,28,46,0.35) 100%)",
        }}
      />

      {/* composición de mobiliario listo para el evento (parte inferior, decorativa) */}
      <AbsoluteFill
        style={{
          opacity: muebles,
          translate: `0px ${interpolate(muebles, [0, 1], [200, 0]) + interpolate(frame, [0, duracion], [0, -20])}px`,
        }}
      >
        <Silla ancho={220} style={{ position: "absolute", left: 70, top: 1390 }} />
        <Silla ancho={220} style={{ position: "absolute", left: 790, top: 1390 }} />
        <MesaConMantel ancho={600} style={{ position: "absolute", left: 240, top: 1300 }} />
        <Silla ancho={250} style={{ position: "absolute", left: 415, top: 1530 }} />
      </AbsoluteFill>
      <Particulas cantidad={34} semilla="cierre" />

      <AbsoluteFill
        style={{
          paddingTop: zonaSegura.arriba,
          paddingLeft: zonaSegura.lateral,
          paddingRight: zonaSegura.lateral,
          alignItems: "center",
        }}
      >
        {/* logo + nombre */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            height: 96,
            opacity: marca,
            translate: `0px ${interpolate(marca, [0, 1], [-40, 0])}px`,
          }}
        >
          {logo ? (
            <Img src={logo} style={{ height: 96, maxWidth: 260, objectFit: "contain" }} />
          ) : negocio.mostrarMarcadores ? (
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: "50%",
                border: "3px dashed rgba(245,196,81,0.8)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 24,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {marcadores.logo}
            </div>
          ) : null}
          <DatoNegocio valor={negocio.nombre} marcador={marcadores.nombre} style={{ fontSize: 44, fontWeight: 800, color: colores.blanco }} />
        </div>

        {/* titular */}
        <div style={{ marginTop: 18, textAlign: "center" }}>
          {textos.cierre.titulo.map((linea, i) => {
            const s = spring({ frame: frame - 8 - i * 5, fps, config: { damping: 11, stiffness: 150 } });
            return (
              <div
                key={linea}
                style={{
                  fontSize: 92,
                  fontWeight: 900,
                  lineHeight: 1.04,
                  letterSpacing: -2,
                  color: i === 2 ? colores.dorado : colores.blanco,
                  textShadow: i === 2 ? sombras.brilloDorado : "0 10px 28px rgba(0,0,0,0.5)",
                  opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                  scale: String(interpolate(s, [0, 1], [1.6, 1])),
                }}
              >
                {linea}
              </div>
            );
          })}
        </div>

        {/* servicios */}
        <div
          style={{
            marginTop: 26,
            fontSize: 46,
            fontWeight: 700,
            color: colores.grisClaro,
            opacity: servicios,
            translate: `0px ${interpolate(servicios, [0, 1], [40, 0])}px`,
            whiteSpace: "nowrap",
          }}
        >
          {textos.cierre.servicios}
        </div>

        {/* transporte */}
        <div
          style={{
            marginTop: 26,
            padding: "20px 34px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(245,196,81,0.55)",
            textAlign: "center",
            opacity: transporte,
            translate: `${interpolate(transporte, [0, 1], [-120, 0])}px 0px`,
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 800, color: colores.blanco }}>{textos.cierre.transporte}</div>
          <div style={{ fontSize: 38, fontWeight: 600, color: colores.dorado, marginTop: 6 }}>{textos.cierre.notaTransporte}</div>
        </div>

        {/* botón de WhatsApp */}
        <div style={{ marginTop: 30, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `6px solid ${colores.verdeWhatsApp}`,
              opacity: frame > tB + 10 ? (1 - onda) * 0.8 : 0,
              scale: `${1 + onda * 0.12} ${1 + onda * 0.45}`,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "24px 40px",
              borderRadius: 999,
              background: `linear-gradient(180deg, #3BE07C 0%, ${colores.verdeWhatsApp} 50%, ${colores.verdeWhatsAppOscuro} 100%)`,
              boxShadow: `0 20px 50px rgba(37,211,102,0.45), ${sombras.tarjeta}`,
              color: colores.blanco,
              fontSize: 48,
              fontWeight: 900,
              whiteSpace: "nowrap",
              opacity: interpolate(boton, [0, 0.2], [0, 1], clamp),
              scale: String(interpolate(boton, [0, 1], [0.3, 1]) * latido),
            }}
          >
            <IconoWhatsApp tam={66} />
            {textos.cierre.llamadaAccion}
          </div>
        </div>

        {/* contacto */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: contacto,
            translate: `0px ${interpolate(contacto, [0, 1], [30, 0])}px`,
          }}
        >
          <DatoNegocio valor={negocio.whatsapp} marcador={marcadores.whatsapp} style={{ fontSize: 56, fontWeight: 900, color: colores.blanco, letterSpacing: 1 }} />
          <DatoNegocio valor={negocio.zonaCobertura} marcador={marcadores.zonaCobertura} style={{ fontSize: 38, fontWeight: 600, color: colores.grisClaro }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
