import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const colores = {
  azulMarino: "#102A43",
  azulProfundo: "#0A1C2E",
  azulMedio: "#1D4A72",
  dorado: "#F5C451",
  doradoOscuro: "#C9962B",
  blanco: "#FFFFFF",
  grisClaro: "#F3F4F6",
  grisMedio: "#C9D1DC",
  verdeWhatsApp: "#25D366",
  verdeWhatsAppOscuro: "#128C4A",
} as const;

const FAMILIA = "Montserrat";

// Fuentes locales (public/assets/fonts) para no depender de internet al renderizar.
for (const peso of ["400", "600", "700", "800", "900"]) {
  loadFont({
    family: FAMILIA,
    url: staticFile(`assets/fonts/montserrat-latin-${peso}-normal.woff2`),
    weight: peso,
  });
}

export const fuente = `${FAMILIA}, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;

/**
 * Zona segura para Facebook/Instagram Reels (1080 × 1920).
 * Arriba ~14 % y abajo ~35 % quedan tapados por la interfaz (nombre de perfil,
 * descripción, botones). La información importante va entre `arriba` y `abajo`.
 */
export const zonaSegura = {
  arriba: 270,
  abajo: 1250,
  lateral: 80,
} as const;

export const sombras = {
  tarjeta: "0 30px 60px rgba(4, 14, 26, 0.45), 0 8px 18px rgba(4, 14, 26, 0.35)",
  suave: "0 14px 30px rgba(4, 14, 26, 0.35)",
  brilloDorado: "0 0 40px rgba(245, 196, 81, 0.55)",
} as const;
