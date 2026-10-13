import React from "react";
import { Composition, Folder, Still } from "remotion";
import { IntroScene } from "./components/IntroScene";
import { OutroScene } from "./components/OutroScene";
import { ProductScene } from "./components/ProductScene";
import { AnuncioAlquiler, duracionVentana } from "./compositions/AnuncioAlquiler";
import { Portada } from "./compositions/Portada";
import { duracionTotal, productos, tiempos } from "./config/business";

const base = { fps: tiempos.fps, width: tiempos.ancho, height: tiempos.alto };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AnuncioAlquilerMobiliario" component={AnuncioAlquiler} durationInFrames={duracionTotal} {...base} />
      <Still id="Portada" component={Portada} width={tiempos.ancho} height={tiempos.alto} />

      {/* Escenas sueltas para revisar cada una por separado en Remotion Studio */}
      <Folder name="Escenas">
        <Composition id="Escena1-Gancho" component={IntroScene} durationInFrames={duracionVentana("gancho")} defaultProps={{ duracion: duracionVentana("gancho") }} {...base} />
        <Composition
          id="Escena2-Sillas"
          component={ProductScene}
          durationInFrames={duracionVentana("sillas")}
          defaultProps={{ producto: productos.sillas, duracion: duracionVentana("sillas") }}
          {...base}
        />
        <Composition
          id="Escena3-Mesas"
          component={ProductScene}
          durationInFrames={duracionVentana("mesas")}
          defaultProps={{ producto: productos.mesas, duracion: duracionVentana("mesas") }}
          {...base}
        />
        <Composition
          id="Escena4-Manteles"
          component={ProductScene}
          durationInFrames={duracionVentana("manteles")}
          defaultProps={{ producto: productos.manteles, duracion: duracionVentana("manteles") }}
          {...base}
        />
        <Composition id="Escena5-Cierre" component={OutroScene} durationInFrames={duracionVentana("cierre")} defaultProps={{ duracion: duracionVentana("cierre") }} {...base} />
      </Folder>
    </>
  );
};
