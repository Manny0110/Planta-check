import datos from "./timeline.json";

export type Entrada = "flash" | "glitch" | "zoomblur" | "barrido" | "ninguna";

export type Segmento = {
  id: string;
  tipo: "video" | "rebobinado" | "congelado";
  /** Segundo inicial y final en el video original. */
  desde: number;
  hasta: number;
  velocidad: number;
  frames?: number;
  entrada: Entrada;
  /** Fotogramas (relativos al segmento) con zoom punch, sacudida y separación RGB. */
  golpes: number[];
  /** Zoom de cámara al inicio y al final del segmento. */
  zoom: [number, number];
  /** Punto de enfoque del zoom, en % del cuadro [x, y]. */
  foco: [number, number];
  audio: "original" | "lento" | "silencio";
};

export const FPS = datos.fps;
export const ANCHO = datos.ancho;
export const ALTO = datos.alto;
export const segmentos = datos.segmentos as Segmento[];

export const framesDe = (s: Segmento) => s.frames ?? Math.round(((s.hasta - s.desde) / s.velocidad) * FPS);

export const conInicio = segmentos.reduce<{ seg: Segmento; inicio: number; frames: number }[]>((lista, seg) => {
  const anterior = lista[lista.length - 1];
  const inicio = anterior ? anterior.inicio + anterior.frames : 0;
  return [...lista, { seg, inicio, frames: framesDe(seg) }];
}, []);

export const duracionTotal = conInicio.reduce((suma, s) => suma + s.frames, 0);
