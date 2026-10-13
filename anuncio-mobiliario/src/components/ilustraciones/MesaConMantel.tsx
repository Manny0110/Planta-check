import React, { useId } from "react";

type Props = {
  ancho: number;
  /** 0 = mantel aún en el aire, 1 = mantel completamente desplegado. */
  despliegue?: number;
  /** Ondulación del borde (en unidades del dibujo). Úsela con valores derivados del fotograma. */
  ondulacion?: number;
  /** Fase de la ondulación, en radianes. */
  fase?: number;
  conCentro?: boolean;
  style?: React.CSSProperties;
};

const ANCHO = 400;
const ALTO = 380;
const Y_CUBIERTA = 120;
const Y_BASTILLA = 336;

const bastilla = (amplitud: number, fase: number): string => {
  const puntos: string[] = [];
  const pasos = 36;
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const x = 14 + t * 372;
    // borde con pliegues: ondas cortas fijas + ondulación animada
    const y = Y_BASTILLA + Math.sin(t * Math.PI * 18) * 3.5 + Math.sin(t * Math.PI * 5 + fase) * amplitud;
    puntos.push(`L${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return puntos.join(" ");
};

/** Mesa redonda con mantel blanco y camino dorado. Proporción 400 × 380. */
export const MesaConMantel: React.FC<Props> = ({
  ancho,
  despliegue = 1,
  ondulacion = 0,
  fase = 0,
  conCentro = true,
  style,
}) => {
  const id = useId().replace(/:/g, "");
  const tela = `tela-${id}`;
  const telaSuperior = `telaSup-${id}`;
  const pliegues = `pliegues-${id}`;
  const sombraPiso = `sombraPisoMantel-${id}`;
  const oro = `oro-${id}`;

  const p = Math.min(1, Math.max(0, despliegue));
  const escalaFalda = 0.12 + 0.88 * p;
  const caida = (1 - p) * -150;

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} width={ancho} height={(ancho * ALTO) / ANCHO} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={tela} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D5DBE4" />
          <stop offset="0.25" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F6F7FA" />
          <stop offset="1" stopColor="#BFC7D3" />
        </linearGradient>
        <radialGradient id={telaSuperior} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3E7EE" />
        </radialGradient>
        <linearGradient id={pliegues} x1="0" y1="0" x2="1" y2="0" spreadMethod="repeat">
          <stop offset="0" stopColor="rgba(16,42,67,0)" />
          <stop offset="0.5" stopColor="rgba(16,42,67,0.07)" />
          <stop offset="1" stopColor="rgba(16,42,67,0)" />
        </linearGradient>
        <linearGradient id={oro} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE29A" />
          <stop offset="0.5" stopColor="#F5C451" />
          <stop offset="1" stopColor="#C9962B" />
        </linearGradient>
        <radialGradient id={sombraPiso}>
          <stop offset="0" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="350" rx="200" ry="22" fill={`url(#${sombraPiso})`} />

      {/* mesa sin mantel (se ve mientras el mantel cae) */}
      <path d="M190 160 L186 330 L214 330 L210 160 Z" fill="#5B4636" />
      <ellipse cx="200" cy="334" rx="70" ry="10" fill="#4A3829" />
      <ellipse cx="200" cy={Y_CUBIERTA + 8} rx="165" ry="42" fill="#5B4636" />
      <ellipse cx="200" cy={Y_CUBIERTA} rx="165" ry="42" fill="#8A6A4F" />

      {/* mantel */}
      <g transform={`translate(0 ${caida})`} opacity={0.35 + 0.65 * p}>
        <g transform={`translate(0 ${Y_CUBIERTA}) scale(1 ${escalaFalda}) translate(0 ${-Y_CUBIERTA})`}>
          <path
            d={`M28 ${Y_CUBIERTA} L14 ${Y_BASTILLA} ${bastilla(ondulacion, fase)} L372 ${Y_CUBIERTA} Z`}
            fill={`url(#${tela})`}
          />
          <rect x="14" y={Y_CUBIERTA} width="372" height={Y_BASTILLA - Y_CUBIERTA + 10} fill={`url(#${pliegues})`} style={{ mixBlendMode: "multiply" }} />
          {[60, 105, 150, 250, 295, 340].map((x) => (
            <path key={x} d={`M${x} ${Y_CUBIERTA + 30} Q${x + (x < 200 ? -6 : 6)} 240 ${x + (x < 200 ? -10 : 10)} ${Y_BASTILLA - 4}`} stroke="rgba(16,42,67,0.10)" strokeWidth="6" fill="none" />
          ))}
          {/* camino dorado que cae al frente */}
          <path d={`M180 ${Y_CUBIERTA + 44} L220 ${Y_CUBIERTA + 44} L223 ${Y_BASTILLA - 40} L177 ${Y_BASTILLA - 40} Z`} fill={`url(#${oro})`} opacity="0.9" />
          <path d={`M177 ${Y_BASTILLA - 40} L200 ${Y_BASTILLA - 22} L223 ${Y_BASTILLA - 40} Z`} fill="#C9962B" />
        </g>
        <ellipse cx="200" cy={Y_CUBIERTA} rx="174" ry="47" fill={`url(#${telaSuperior})`} />
        <path d={`M192 ${Y_CUBIERTA - 46} L208 ${Y_CUBIERTA - 46} L220 ${Y_CUBIERTA + 46} L180 ${Y_CUBIERTA + 46} Z`} fill={`url(#${oro})`} opacity={0.85} />
      </g>

      {/* centro de mesa */}
      {conCentro ? (
        <g opacity={Math.max(0, (p - 0.75) / 0.25)}>
          <path d="M188 116 L192 92 L208 92 L212 116 Z" fill={`url(#${oro})`} />
          <circle cx="192" cy="80" r="11" fill="#FFFFFF" />
          <circle cx="208" cy="78" r="12" fill="#F7E7C6" />
          <circle cx="200" cy="66" r="12" fill="#FFFFFF" />
          <circle cx="186" cy="66" r="8" fill="#F5C451" opacity="0.9" />
          <circle cx="214" cy="64" r="8" fill="#9BC59D" />
        </g>
      ) : null}
    </svg>
  );
};
