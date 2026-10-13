import { Audio, Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Camara } from "./Camara";
import { conInicio, duracionTotal, FPS, Segmento } from "./linea";

const cubrir: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

const Toma: React.FC<{ seg: Segmento }> = ({ seg }) => {
  if (seg.tipo === "congelado") return <Img src={staticFile("fuente/congelado.png")} style={cubrir} />;
  if (seg.tipo === "rebobinado") return <Video src={staticFile("fuente/rebobinado.mp4")} muted objectFit="cover" style={cubrir} />;
  return (
    <Video
      src={staticFile("fuente/hd.mp4")}
      muted
      trimBefore={Math.round(seg.desde * FPS)}
      playbackRate={seg.velocidad}
      objectFit="cover"
      style={cubrir}
    />
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* look cálido y limpio: más color y contraste, sin exagerar */}
      <AbsoluteFill style={{ filter: "saturate(1.18) contrast(1.07) brightness(1.03) sepia(0.06)" }}>
        {conInicio.map(({ seg, inicio, frames }) => (
          <Sequence key={seg.id} name={seg.id} from={inicio} durationInFrames={frames}>
            <Camara seg={seg} frames={frames}>
              <Toma seg={seg} />
            </Camara>
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 48%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)" }} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(255,190,110,0.18) 0%, rgba(255,190,110,0) 70%)",
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: interpolate(frame, [duracionTotal - 18, duracionTotal], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
      <Audio src={staticFile("banda-sonora.mp3")} />
    </AbsoluteFill>
  );
};
