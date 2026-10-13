import datos from "./timeline.json";

export type Entrada = "corte" | "disolver" | "zoomthrough" | "flashsuave";

export type Segmento = {
  id: string;
  tipo: "video" | "rebobinado" | "congelado";
  /** Segundo inicial y final en el video original. */
  desde: number;
  hasta: number;
  velocidad: number;
  frames?: number;
  entrada: Entrada;
  /** Fotogramas que el segmento se superpone con el anterior (para el fundido). */
  traslape: number;
  /** Zoom de cámara al inicio y al final. */
  zoom: [number, number];
  /** Punto que la cámara mantiene centrado, en % del cuadro, al inicio y al final. */
  foco: [[number, number], [number, number]];
  /** Fotogramas (relativos al segmento) con un golpe suave de zoom. */
  golpes: number[];
  audio: "original" | "lento" | "silencio";
};

export const FPS = datos.fps;
export const ANCHO = datos.ancho;
export const ALTO = datos.alto;
export const segmentos = datos.segmentos as Segmento[];

export const framesDe = (s: Segmento) => s.frames ?? Math.round(((s.hasta - s.desde) / s.velocidad) * FPS);

/** Mismo cálculo que scripts/preparar-medios.py. */
export const conInicio = segmentos.reduce<{ seg: Segmento; inicio: number; frames: number }[]>((lista, seg) => {
  const anterior = lista[lista.length - 1];
  const inicio = anterior ? anterior.inicio + anterior.frames - seg.traslape : 0;
  return [...lista, { seg, inicio, frames: framesDe(seg) }];
}, []);

const ultimo = conInicio[conInicio.length - 1];
export const duracionTotal = ultimo.inicio + ultimo.frames;
