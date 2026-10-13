import React from "react";
import { Composition } from "remotion";
import { ALTO, ANCHO, duracionTotal, FPS } from "./linea";
import { Reel } from "./Reel";

export const RemotionRoot: React.FC = () => {
  return <Composition id="ReelAbueloNieto" component={Reel} durationInFrames={duracionTotal} fps={FPS} width={ANCHO} height={ALTO} />;
};
