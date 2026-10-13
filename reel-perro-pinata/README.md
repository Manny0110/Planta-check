# Reel: el perro de la piñata

Edición vertical para Facebook Reels (1080 × 1920, 30 fps, 21,7 s, H.264, audio a -14 LUFS), sin texto en pantalla, hecha con Remotion.

## Estructura de retención

| # | Segmento | Efecto |
| --- | --- | --- |
| 1 | **Gancho** (adelanto de la fiesta y la piñata) | flash blanco + boom, zoom punch, RGB split, subida de tensión |
| 2 | **Rebobinado** (rewind al inicio) | glitch con franjas, sonido de cinta rebobinando |
| 3 | Tirón de la cuerda | zoom con desenfoque, zoom punch + sacudida en cada tirón |
| 4 | Barrido de cámara | whip pan con desenfoque de movimiento + whoosh |
| 5 | **Revelación** de la fiesta | cámara lenta 0,6×, empuje de zoom, boom grave |
| 6 | Salto del perro | whip pan + golpe |
| 7 | **Congelado** en la cara del perro | freeze frame, zoom 1,45×, obturador + boom |
| 8 | En la orilla jalando | 1,25×, zoom punches rítmicos |
| 9 | Jugando | 1,6× (speed ramp), glitch de entrada |
| 10 | Final relajado | whip pan, empuje de zoom lento y cierre que invita al loop |

Encima de todo: corrección de color vívida (saturación y contraste), viñeta y un leve destello cálido (light leak) en los golpes.

## Cómo volver a generarlo

```console
npm i
# Coloque el video original en public/fuente/original.mp4
npm run audio      # crea el rebobinado, el congelado, los efectos y la banda sonora
npm run render     # genera out/reel-perro-pinata-facebook.mp4 (comprimido para Facebook)
npm run dev        # previsualizar en Remotion Studio
```

Para cambiar cortes, velocidades, zooms o golpes edite `src/timeline.json` y ejecute `npm run audio` y `npm run render` (el audio se rearma con los mismos tiempos).

## Audio

- El audio original del video se mantiene, ajustado a la velocidad de cada tramo.
- Los efectos (boom, whoosh, golpes, rebobinado, obturador, glitch, ding) y la base rítmica están **sintetizados** por `scripts/preparar-medios.py`: no usan material de terceros.
- Mezcla final normalizada para redes (~-14 LUFS).

## Derechos

El video original no se versiona en git (`public/fuente/` y `out/` están en `.gitignore`). Publíquelo solo si tiene permiso del autor o si el video es suyo.
