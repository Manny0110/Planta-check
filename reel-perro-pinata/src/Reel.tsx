import { Audio, Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Camara } from "./Camara";
import { conInicio, duracionTotal, FPS, Segmento } from "./linea";

const cubrir: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

const Toma: React.FC<{ seg: Segmento }> = ({ seg }) => {
  if (seg.tipo === "congelado") {
    return <Img src={staticFile("fuente/congelado.png")} style={cubrir} />;
  }
  if (seg.tipo === "rebobinado") {
    return <Video src={staticFile("fuente/rebobinado.mp4")} muted objectFit="cover" style={cubrir} />;
  }
  return (
    <Video
      src={staticFile("fuente/original.mp4")}
      muted
      trimBefore={Math.round(seg.desde * FPS)}
      playbackRate={seg.velocidad}
      objectFit="cover"
      style={cubrir}
    />
  );
};

/** Look de color y capas de acabado que van sobre todo el reel. */
const Acabado: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }}
      />
      {/* respiración de luz muy sutil para que la imagen nunca se sienta plana */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(160deg, rgba(255,200,120,0.10) 0%, rgba(0,0,0,0) 45%, rgba(60,120,255,0.08) 100%)",
          opacity: 0.6 + 0.4 * Math.sin(frame / 20),
          mixBlendMode: "soft-light",
        }}
      />
      {/* fundido final a negro muy corto: ayuda a que el loop se sienta natural */}
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: interpolate(frame, [duracionTotal - 6, duracionTotal], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </>
  );
};

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ filter: "saturate(1.35) contrast(1.12) brightness(1.04)" }}>
        {conInicio.map(({ seg, inicio, frames }) => (
          <Sequence key={seg.id} name={seg.id} from={inicio} durationInFrames={frames}>
            <Camara frames={frames} entrada={seg.entrada} golpes={seg.golpes} zoom={seg.zoom} foco={seg.foco} semilla={seg.id}>
              <Toma seg={seg} />
            </Camara>
          </Sequence>
        ))}
      </AbsoluteFill>
      <Acabado />
      <Audio src={staticFile("banda-sonora.mp3")} />
    </AbsoluteFill>
  );
};
