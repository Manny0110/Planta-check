# Reel: el penal del abuelo

Edición vertical para Facebook Reels (1080 × 1920, 30 fps, 19,3 s, H.264, audio a -14 LUFS), sin texto en pantalla, hecha con Remotion. Estilo sobrio: pocos efectos, transiciones suaves y la historia al centro.

## Historia y estructura

| Tiempo | Segmento | Qué pasa | Tratamiento |
| --- | --- | --- | --- |
| 0,0–2,0 s | **Gancho** | el nieto se pone de portero y el abuelo se acomoda para patear | cámara lenta 0,5×, acercamiento lento, latidos que se aceleran |
| 2,0–3,1 s | **Patada + congelado** | se congela justo al patear, sin mostrar el resultado | ultra lento 0,25× y congelado con destello suave |
| 3,1–3,9 s | **Rebobinado** | la historia vuelve al principio | reversa rápida con desenfoque de movimiento |
| 3,9–12,7 s | Inicio y pases | abuelo y nieto juegan en el callejón | zoom de paso, fundido, acelerado leve (1,35×), música de piano |
| 12,5–14,2 s | Tensión | el nieto se para en la portería | cámara lenta 0,6× y acercamiento, la música baja |
| 14,2–17,5 s | **Penal** | el abuelo patea y el nieto la para (16,6 s) | cámara lenta 0,45×, la cámara sigue la pelota hasta el niño, golpe suave y la música vuelve |
| 17,3–19,3 s | Final | el nieto sigue jugando | fundido y alejamiento lento |

El gancho deja la pregunta abierta (¿la mete o no?) y la respuesta llega al final: esa curiosidad es la que sostiene la retención.

## Cómo volver a generarlo

```console
npm i
# Coloque el video original en public/fuente/original.mp4
npm run audio      # crea la versión HD, el rebobinado, el congelado y la banda sonora
npx remotion render ReelAbueloNieto out/reel-abuelo-nieto.mp4 --codec=h264 --crf=16
npm run exportar   # versión comprimida para Facebook: out/reel-abuelo-nieto-facebook.mp4
npm run dev        # previsualizar en Remotion Studio
```

Cortes, velocidades, zoom y encuadre se editan en `src/timeline.json`; después hay que volver a correr `npm run audio` y el render.

## Audio

- Audio original del video, ajustado a la velocidad de cada tramo.
- El piano, el colchón, los latidos, los whooshes y el golpe del final los **sintetiza** `scripts/preparar-medios.py`, así que no hay material de terceros.
- Queda espacio para una voz en off: la música baja en la tensión y el penal.

## Derechos

El video original y los renders no se versionan (`.gitignore`). Publíquelo solo si es suyo o tiene permiso.
