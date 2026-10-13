/**
 * CONFIGURACIÓN CENTRAL DEL ANUNCIO
 * ---------------------------------
 * Todo lo que se puede cambiar sin tocar la animación está aquí:
 * datos del negocio, textos, precios, imágenes, audio y tiempos.
 */

export const negocio = {
  /** Nombre comercial tal como debe aparecer. Vacío = se muestra un marcador. */
  nombre: "",
  /** Número de WhatsApp, por ejemplo "7000-0000". Vacío = se muestra un marcador. */
  whatsapp: "",
  /** Zona de cobertura, por ejemplo "San Salvador y alrededores". Vacío = marcador. */
  zonaCobertura: "",
  /**
   * true: muestra recuadros punteados donde faltan datos (útil para revisar).
   * false: oculta por completo los datos que estén vacíos.
   */
  mostrarMarcadores: true,
};

export const marcadores = {
  nombre: "NOMBRE DEL NEGOCIO",
  whatsapp: "TU NÚMERO DE WHATSAPP",
  zonaCobertura: "ZONA DE COBERTURA",
  logo: "LOGO",
};

export const textos = {
  gancho: {
    titulo: ["¿TENÉS UN", "EVENTO", "PRONTO?"],
    subtitulo: "¡Nosotros ponemos el mobiliario!",
  },
  cierre: {
    titulo: ["¡HACÉ QUE TU", "EVENTO SEA", "ESPECIAL!"],
    servicios: "🪑 Sillas | 🍽️ Mesas | ✨ Manteles",
    transporte: "🚚 Servicio de transporte disponible",
    notaTransporte: "Transporte cotizado según ubicación.",
    llamadaAccion: "¡COTIZÁ POR WHATSAPP!",
  },
};

export type IdProducto = "sillas" | "mesas" | "manteles";

export type Producto = {
  id: IdProducto;
  emoji: string;
  /** Primera línea del título ("ALQUILER DE"). */
  antetitulo: string;
  /** Línea destacada ("SILLAS"). */
  titulo: string;
  precio: string;
  unidad: string;
  /** Ruta dentro de /public. Si el archivo existe se usa la foto; si no, la ilustración. */
  imagen: string;
};

export const productos: Record<IdProducto, Producto> = {
  sillas: {
    id: "sillas",
    emoji: "🪑",
    antetitulo: "ALQUILER DE",
    titulo: "SILLAS",
    precio: "$0.20",
    unidad: "C/U",
    imagen: "assets/sillas.png",
  },
  mesas: {
    id: "mesas",
    emoji: "🍽️",
    antetitulo: "ALQUILER DE",
    titulo: "MESAS",
    precio: "$2.00",
    unidad: "C/U",
    imagen: "assets/mesas.png",
  },
  manteles: {
    id: "manteles",
    emoji: "✨",
    antetitulo: "ALQUILER DE",
    titulo: "MANTELES",
    precio: "$1.25",
    unidad: "C/U",
    imagen: "assets/manteles.png",
  },
};

/** Imágenes generales (rutas dentro de /public). Si no existen se usan ilustraciones. */
export const imagenes = {
  evento: "assets/evento.jpg",
  logo: "assets/logo.png",
};

/** Audio (rutas dentro de /public). Si un archivo no existe, simplemente no suena. */
export const audio = {
  musica: { archivo: "assets/audio/musica.mp3", volumen: 0.45, fundidoEntrada: 15, fundidoSalida: 45 },
  whoosh: { archivo: "assets/audio/whoosh.mp3", volumen: 0.6 },
  pop: { archivo: "assets/audio/pop.mp3", volumen: 0.7 },
  cierre: { archivo: "assets/audio/cierre.mp3", volumen: 0.7 },
};

/** Tiempos en fotogramas (30 fps). La suma de las escenas debe ser 600 (20 s). */
export const tiempos = {
  fps: 30,
  ancho: 1080,
  alto: 1920,
  escenas: {
    gancho: 90, // 0–3 s
    sillas: 120, // 3–7 s
    mesas: 120, // 7–11 s
    manteles: 120, // 11–15 s
    cierre: 150, // 15–20 s
  },
  /** Fotogramas de transición, centrados en cada cambio de escena. */
  transicion: 16,
  /** Fotograma (dentro de cada escena de producto) en que aparece el precio. */
  aparicionPrecio: 32,
  /** Fotograma (dentro del cierre) en que aparece el botón de WhatsApp. */
  aparicionBoton: 78,
};

export const ordenEscenas = ["gancho", "sillas", "mesas", "manteles", "cierre"] as const;
export type IdEscena = (typeof ordenEscenas)[number];

/** Inicio absoluto de cada escena en la línea de tiempo principal. */
export const inicioEscena = (id: IdEscena): number => {
  let inicio = 0;
  for (const escena of ordenEscenas) {
    if (escena === id) return inicio;
    inicio += tiempos.escenas[escena];
  }
  return inicio;
};

export const duracionTotal = ordenEscenas.reduce((suma, id) => suma + tiempos.escenas[id], 0);
