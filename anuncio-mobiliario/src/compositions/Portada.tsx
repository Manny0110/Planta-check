import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { imagenes, productos, textos } from "../config/business";
import { recursoSiExiste } from "../config/recursos";
import { Particulas } from "../components/Fondo";
import { EventoIlustrado } from "../components/ilustraciones/EventoIlustrado";
import { colores, fuente, sombras, zonaSegura } from "../styles/theme";

/** Imagen de portada (PNG) para el Reel: gancho + los tres precios + llamada a la acción. */
export const Portada: React.FC = () => {
  const fotoEvento = recursoSiExiste(imagenes.evento);
  return (
    <AbsoluteFill style={{ fontFamily: fuente, backgroundColor: colores.azulProfundo }}>
      {fotoEvento ? <Img src={fotoEvento} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <EventoIlustrado zoom={1.05} />}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(10,28,46,0.92) 0%, rgba(10,28,46,0.8) 55%, rgba(10,28,46,0.4) 80%, rgba(10,28,46,0.7) 100%)",
        }}
      />
      <Particulas cantidad={30} semilla="portada" />
      <AbsoluteFill style={{ paddingTop: zonaSegura.arriba + 10, alignItems: "center" }}>
        {textos.gancho.titulo.map((linea, i) => (
          <div
            key={linea}
            style={{
              fontSize: [104, 172, 130][i],
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: i === 1 ? colores.dorado : colores.blanco,
              textShadow: i === 1 ? sombras.brilloDorado : "0 10px 30px rgba(0,0,0,0.55)",
            }}
          >
            {linea}
          </div>
        ))}
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 22, width: 860 }}>
          {Object.values(productos).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 34px",
                borderRadius: 32,
                background: `linear-gradient(160deg, ${colores.blanco} 0%, ${colores.grisClaro} 100%)`,
                borderLeft: `14px solid ${colores.dorado}`,
                boxShadow: sombras.tarjeta,
              }}
            >
              <div style={{ fontSize: 52, fontWeight: 800, color: colores.azulMarino }}>
                {p.emoji} {p.titulo}
              </div>
              <div style={{ fontSize: 72, fontWeight: 900, color: colores.azulMarino }}>
                {p.precio} <span style={{ fontSize: 36, color: colores.doradoOscuro }}>{p.unidad}</span>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 44,
            padding: "22px 44px",
            borderRadius: 999,
            background: `linear-gradient(180deg, #3BE07C 0%, ${colores.verdeWhatsApp} 50%, ${colores.verdeWhatsAppOscuro} 100%)`,
            color: colores.blanco,
            fontSize: 52,
            fontWeight: 900,
            boxShadow: sombras.tarjeta,
          }}
        >
          {textos.cierre.llamadaAccion}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
