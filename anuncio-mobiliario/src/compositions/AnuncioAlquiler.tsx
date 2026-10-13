import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence } from "remotion";
import { audio, duracionTotal, IdEscena, inicioEscena, ordenEscenas, productos, tiempos } from "../config/business";
import { recursoSiExiste } from "../config/recursos";
import { FondoMarca } from "../components/Fondo";
import { IntroScene } from "../components/IntroScene";
import { OutroScene } from "../components/OutroScene";
import { ProductScene } from "../components/ProductScene";
import { DestelloTransicion, TransicionEscena } from "../components/TransitionEffect";

const T = tiempos.transicion;
const MITAD = T / 2;

/** Ventana real de cada escena: arranca medio cruce antes y termina medio cruce después del corte. */
const ventana = (id: IdEscena) => {
  const i = ordenEscenas.indexOf(id);
  const inicio = inicioEscena(id);
  const desde = i === 0 ? 0 : inicio - MITAD;
  const hasta = i === ordenEscenas.length - 1 ? duracionTotal : inicio + tiempos.escenas[id] + MITAD;
  return { desde, duracion: hasta - desde, entrada: i > 0, salida: i < ordenEscenas.length - 1, direccion: (i % 2 === 0 ? -1 : 1) as 1 | -1 };
};

const contenido = (id: IdEscena, duracion: number) => {
  if (id === "gancho") return <IntroScene duracion={duracion} />;
  if (id === "cierre") return <OutroScene duracion={duracion} />;
  return <ProductScene producto={productos[id]} duracion={duracion} />;
};

const Sonidos: React.FC = () => {
  const musica = recursoSiExiste(audio.musica.archivo);
  const whoosh = recursoSiExiste(audio.whoosh.archivo);
  const pop = recursoSiExiste(audio.pop.archivo);
  const cierre = recursoSiExiste(audio.cierre.archivo);
  const cortes = ordenEscenas.slice(1).map((id) => inicioEscena(id));
  const productosEnOrden = ordenEscenas.filter((id) => id !== "gancho" && id !== "cierre");

  return (
    <>
      {musica ? (
        <Audio
          src={musica}
          volume={(f) =>
            audio.musica.volumen *
            interpolate(
              f,
              [0, audio.musica.fundidoEntrada, duracionTotal - audio.musica.fundidoSalida, duracionTotal],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
      {whoosh
        ? [0, ...cortes].map((corte, i) => (
            <Sequence key={`whoosh-${i}`} from={Math.max(0, corte - MITAD - 2)} durationInFrames={24} layout="none">
              <Audio src={whoosh} volume={audio.whoosh.volumen} />
            </Sequence>
          ))
        : null}
      {pop
        ? productosEnOrden.map((id) => (
            <Sequence key={`pop-${id}`} from={ventana(id).desde + tiempos.aparicionPrecio + 2} durationInFrames={12} layout="none">
              <Audio src={pop} volume={audio.pop.volumen} />
            </Sequence>
          ))
        : null}
      {cierre ? (
        <Sequence from={ventana("cierre").desde + tiempos.aparicionBoton} durationInFrames={66} layout="none">
          <Audio src={cierre} volume={audio.cierre.volumen} />
        </Sequence>
      ) : null}
    </>
  );
};

/** Composición principal: 5 escenas superpuestas con cruces en profundidad + destellos + audio. */
export const AnuncioAlquiler: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1C2E" }}>
      <FondoMarca />

      {ordenEscenas.map((id) => {
        const v = ventana(id);
        return (
          <Sequence key={id} name={id} from={v.desde} durationInFrames={v.duracion}>
            <TransicionEscena duracion={v.duracion} transicion={T} entrada={v.entrada} salida={v.salida} direccion={v.direccion}>
              {contenido(id, v.duracion)}
            </TransicionEscena>
          </Sequence>
        );
      })}

      {ordenEscenas.slice(1).map((id, i) => (
        <Sequence key={`destello-${id}`} name={`destello-${id}`} from={inicioEscena(id) - MITAD - 4} durationInFrames={T + 8}>
          <DestelloTransicion duracion={T + 8} direccion={i % 2 === 0 ? 1 : -1} />
        </Sequence>
      ))}

      <Sonidos />
    </AbsoluteFill>
  );
};

/** Duración de la ventana de una escena: la usa Root.tsx para las vistas previas sueltas. */
export const duracionVentana = (id: IdEscena) => ventana(id).duracion;
