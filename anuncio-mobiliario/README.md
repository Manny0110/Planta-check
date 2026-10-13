# Anuncio: alquiler de sillas, mesas y manteles

Anuncio vertical para Facebook Reels e Instagram Reels, hecho con Remotion (React + TypeScript).

- 1080 × 1920 (9:16), 30 fps, 20 s (600 fotogramas), MP4 H.264
- Composición principal: `AnuncioAlquilerMobiliario`
- Portada: composición fija `Portada` (PNG)

Entregables ya renderizados:

- `out/anuncio-alquiler-sillas-mesas-manteles.mp4`
- `out/portada-anuncio-alquiler.png`

## Comandos

```console
npm i                 # instalar dependencias
npm run dev           # previsualizar en Remotion Studio
npm run typecheck     # comprobación de TypeScript
npm run render        # renderizar el MP4 final en out/
npm run portada       # renderizar la portada PNG en out/
```

## Lo que se cambia en un solo lugar: `src/config/business.ts`

| Qué | Dónde |
| --- | --- |
| Nombre del negocio, WhatsApp, zona de cobertura | `negocio` |
| Mostrar u ocultar los recuadros punteados de los datos que faltan | `negocio.mostrarMarcadores` |
| Precios, unidades y títulos de cada producto | `productos` |
| Textos del gancho y del cierre | `textos` |
| Duración de cada escena, transiciones y momento en que aparecen los precios | `tiempos` |
| Volumen y fundidos del audio | `audio` |

Mientras `nombre`, `whatsapp` o `zonaCobertura` estén vacíos, el video muestra un recuadro punteado en su lugar. No se inventa ningún dato de contacto.

## Fotos reales

Ponga los archivos en `public/assets/` **con estos nombres exactos**. Si un archivo existe se usa automáticamente; si no, el video usa la ilustración provisional:

| Archivo | Se usa en |
| --- | --- |
| `sillas.png` | Escena 2 (mejor si es un PNG con fondo transparente) |
| `mesas.png` | Escena 3 |
| `manteles.png` | Escena 4 |
| `evento.jpg` | Fondo de la escena 1 y de la portada |
| `logo.png` | Cierre, junto al nombre del negocio |

Use solo fotos propias o con licencia de uso comercial.

## Audio

Los archivos de `public/assets/audio/` (`musica.mp3`, `whoosh.mp3`, `pop.mp3`, `cierre.mp3`) son **provisionales**: los sintetiza el script `scripts/generar-audio-provisional.py`, así que no contienen material de terceros. Para cambiarlos, reemplace cada archivo por uno con licencia comercial y el mismo nombre. Si borra un archivo, ese sonido simplemente deja de sonar.

El anuncio se entiende sin sonido: todos los mensajes van en pantalla.

## Estructura

```
src/
  Root.tsx                       composiciones (anuncio, portada, escenas sueltas)
  compositions/AnuncioAlquiler.tsx  línea de tiempo, transiciones y audio
  compositions/Portada.tsx       portada PNG
  components/IntroScene.tsx      escena 1: gancho
  components/ProductScene.tsx    escenas 2–4: sillas, mesas, manteles
  components/OutroScene.tsx      escena 5: cierre y WhatsApp
  components/AnimatedPrice.tsx   tarjeta de precio animada
  components/TransitionEffect.tsx  cruces con profundidad + destello dorado
  components/Fondo.tsx           fondo de marca, partículas, escenario
  components/ilustraciones/      dibujos SVG provisionales
  config/business.ts             datos, textos, precios, tiempos, audio
  config/recursos.ts             detecta qué archivos de /public existen
  styles/theme.ts                colores, fuente y zona segura de Reels
```

## Zona segura de Reels

La información importante va entre los píxeles 270 y 1250 de alto, y a 80 px de los bordes laterales. La parte de abajo solo lleva elementos decorativos, porque ahí la tapan la descripción y los botones de la aplicación.

## Licencias

- Fuente Montserrat (SIL Open Font License), incluida en `public/assets/fonts/`.
- Remotion es gratis para personas y empresas de hasta 3 empleados; las empresas más grandes necesitan licencia: <https://remotion.pro/license>.
