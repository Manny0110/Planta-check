import { getStaticFiles, staticFile } from "remotion";

/** Devuelve la URL del archivo de /public si existe, o null para usar el recurso provisional. */
export const recursoSiExiste = (ruta: string): string | null => {
  const existe = getStaticFiles().some((archivo) => archivo.name === ruta);
  return existe ? staticFile(ruta) : null;
};
