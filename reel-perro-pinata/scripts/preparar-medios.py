"""
Prepara los medios del reel a partir de public/fuente/original.mp4 y src/timeline.json:

  public/fuente/rebobinado.mp4   tramo en reversa y acelerado (efecto "rebobinar")
  public/fuente/congelado.png    cuadro congelado
  public/sfx/*.wav               efectos de sonido SINTETIZADOS aquí (sin material de terceros)
  public/banda-sonora.mp3        audio final: audio original editado + efectos + ritmo, a -14 LUFS

Uso:  python3 scripts/preparar-medios.py
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUB = os.path.join(RAIZ, "public")
FUENTE = os.path.join(PUB, "fuente", "original.mp4")
SR = 44100
rng = np.random.default_rng(11)

linea = json.load(open(os.path.join(RAIZ, "src", "timeline.json")))
FPS = linea["fps"]


def frames_de(seg):
    if "frames" in seg:
        return seg["frames"]
    return round((seg["hasta"] - seg["desde"]) / seg["velocidad"] * FPS)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def leer_wav(ruta):
    with wave.open(ruta) as w:
        datos = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return datos.reshape(-1, w.getnchannels())


def guardar_wav(ruta, datos):
    datos = np.clip(datos, -1, 1)
    if datos.ndim == 1:
        datos = np.stack([datos, datos], axis=1)
    with wave.open(ruta, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((datos * 32767).astype(np.int16).tobytes())


def t(seg_s):
    return np.arange(int(seg_s * SR)) / SR


def pasa_bajos(x, a):
    y = np.zeros_like(x)
    acc = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def norm(x, pico=0.9):
    return x / max(1e-9, np.max(np.abs(x))) * pico


# ------------------------------------------------------------------ efectos de sonido
def sfx_boom():
    tt = t(2.2)
    f = 38 + 90 * np.exp(-tt * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.6)
    golpe = pasa_bajos(rng.normal(0, 1, len(tt)), 0.25) * np.exp(-tt * 30)
    return norm(np.tanh(2.2 * (sub + 0.6 * golpe)))


def sfx_golpe():
    tt = t(0.35)
    f = 55 + 160 * np.exp(-tt * 40)
    k = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 12)
    ruido = pasa_bajos(rng.normal(0, 1, len(tt)), 0.5) * np.exp(-tt * 60) * 0.5
    return norm(np.tanh(1.8 * (k + ruido)))


def sfx_whoosh(dur=0.55):
    tt = t(dur)
    ruido = rng.normal(0, 1, len(tt))
    barrido = 0.02 + 0.4 * np.sin(np.pi * tt / dur) ** 2
    w = pasa_bajos(ruido, barrido) - pasa_bajos(ruido, barrido * 0.12)
    env = np.sin(np.pi * tt / dur) ** 1.6
    izq, der = w * env * (1 - 0.7 * tt / dur), w * env * (0.3 + 0.7 * tt / dur)
    return norm(np.stack([izq, der], axis=1))


def sfx_subida(dur=1.2):
    tt = t(dur)
    ruido = rng.normal(0, 1, len(tt))
    a = 0.01 + 0.5 * (tt / dur) ** 2
    s = pasa_bajos(ruido, a) - pasa_bajos(ruido, a * 0.1)
    tono = np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / dur) ** 2) / SR) * 0.35
    return norm((s + tono) * (tt / dur) ** 1.5)


def sfx_rebobinar(dur=0.8):
    tt = t(dur)
    f = 1400 * np.exp(-tt * 1.2) * (1 + 0.08 * np.sin(2 * np.pi * 18 * tt))
    fase = 2 * np.pi * np.cumsum(f) / SR
    sierra = 2 * ((fase / (2 * np.pi)) % 1) - 1
    chirrido = pasa_bajos(sierra, 0.3) + 0.3 * pasa_bajos(rng.normal(0, 1, len(tt)), 0.6)
    trozos = (np.floor(tt * 24) % 2) * 0.35 + 0.65
    return norm(chirrido * trozos * np.minimum(1, (dur - tt) * 12) * np.minimum(1, tt * 40))


def sfx_obturador():
    tt = t(0.25)
    clic = np.zeros_like(tt)
    for inicio in (0.0, 0.07):
        on = tt >= inicio
        tl = np.clip(tt - inicio, 0, None)
        clic += on * pasa_bajos(rng.normal(0, 1, len(tt)), 0.7) * np.exp(-tl * 160)
    return norm(clic)


def sfx_glitch(dur=0.3):
    tt = t(dur)
    f = 180 + 900 * (np.floor(tt * 40) % 3)
    cuadrada = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    cortes = (rng.random(int(dur * 40) + 1)[np.floor(tt * 40).astype(int)] > 0.3)
    return norm(np.round(cuadrada * cortes * 4) / 4 * np.exp(-tt * 4)) * 0.8


def sfx_ding():
    tt = t(1.4)
    x = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(1318.5, 3), (1975.5, 4), (2637, 6)])
    return norm(x)


def ritmo(dur, bpm=128):
    """Base rítmica sencilla y sintetizada (bombo, palmas, platillo y bajo)."""
    n = int(dur * SR)
    salida = np.zeros((n, 2))
    pulso = 60 / bpm
    bombo = sfx_golpe() * 0.8
    for b in range(int(dur / pulso) + 1):
        i = int(b * pulso * SR)
        if i < n:
            e = min(n, i + len(bombo))
            salida[i:e] += bombo[: e - i][:, None]
        ih = int((b + 0.5) * pulso * SR)
        if ih < n:
            th = t(0.06)
            plat = rng.normal(0, 1, len(th))
            plat = (plat - pasa_bajos(plat, 0.6)) * np.exp(-th * 80) * 0.25
            e = min(n, ih + len(th))
            salida[ih:e] += plat[: e - ih][:, None]
        if b % 2 == 1 and i < n:
            tc = t(0.15)
            palma = pasa_bajos(rng.normal(0, 1, len(tc)), 0.4) * np.exp(-tc * 25) * 0.45
            e = min(n, i + len(tc))
            salida[i:e] += palma[: e - i][:, None]
    raices = [55.0, 55.0, 65.41, 49.0]
    for c in range(int(dur / (pulso * 4)) + 1):
        for k in range(8):
            i = int((c * 4 + k * 0.5) * pulso * SR)
            if i >= n:
                break
            tb = t(0.2)
            bajo = np.tanh(2 * np.sin(2 * np.pi * raices[c % 4] * tb)) * np.exp(-tb * 8) * 0.35
            e = min(n, i + len(tb))
            salida[i:e] += bajo[: e - i][:, None]
    return salida


# ------------------------------------------------------------------ medios de video
os.makedirs(os.path.join(PUB, "sfx"), exist_ok=True)
for seg in linea["segmentos"]:
    if seg["tipo"] == "rebobinado":
        dur_salida = frames_de(seg) / FPS
        factor = (seg["hasta"] - seg["desde"]) / dur_salida
        ffmpeg("-ss", str(seg["desde"]), "-t", str(seg["hasta"] - seg["desde"]), "-i", FUENTE,
               "-vf", f"reverse,setpts=PTS/{factor:.4f},fps={FPS}", "-an", "-c:v", "libx264", "-crf", "14",
               "-pix_fmt", "yuv420p", os.path.join(PUB, "fuente", "rebobinado.mp4"))
    if seg["tipo"] == "congelado":
        ffmpeg("-ss", str(seg["desde"]), "-i", FUENTE, "-frames:v", "1", os.path.join(PUB, "fuente", "congelado.png"))

# ------------------------------------------------------------------ banda sonora
efectos = {
    "boom": sfx_boom(), "golpe": sfx_golpe(), "whoosh": sfx_whoosh(), "subida": sfx_subida(),
    "rebobinar": sfx_rebobinar(), "obturador": sfx_obturador(), "glitch": sfx_glitch(), "ding": sfx_ding(),
}
for nombre, datos in efectos.items():
    guardar_wav(os.path.join(PUB, "sfx", f"{nombre}.wav"), datos)

total_frames = sum(frames_de(s) for s in linea["segmentos"])
dur_total = total_frames / FPS
mezcla = np.zeros((int(dur_total * SR) + SR, 2))


def poner(datos, segundo, vol):
    if datos.ndim == 1:
        datos = np.stack([datos, datos], axis=1)
    i = int(segundo * SR)
    e = min(len(mezcla), i + len(datos))
    if i < len(mezcla):
        mezcla[i:e] += datos[: e - i] * vol


with tempfile.TemporaryDirectory() as tmp:
    inicio = 0
    for seg in linea["segmentos"]:
        n_frames = frames_de(seg)
        seg_inicio = inicio / FPS
        dur = n_frames / FPS
        if seg["audio"] in ("original", "lento") and seg["tipo"] == "video":
            pieza = os.path.join(tmp, f"{seg['id']}.wav")
            v = seg["velocidad"]
            filtro = f"asetrate={SR}*{v},aresample={SR}" if seg["audio"] == "lento" else (f"atempo={v}" if v != 1 else "anull")
            ffmpeg("-ss", str(seg["desde"]), "-t", str(seg["hasta"] - seg["desde"]), "-i", FUENTE, "-vn",
                   "-af", filtro, "-ar", str(SR), "-ac", "2", pieza)
            audio = leer_wav(pieza)[: int(dur * SR)]
            # fundido corto en los bordes para que los cortes no hagan "clic"
            f = min(len(audio) // 4, int(0.012 * SR))
            if f > 0:
                rampa = np.linspace(0, 1, f)[:, None]
                audio[:f] *= rampa
                audio[-f:] *= rampa[::-1]
            poner(audio, seg_inicio, 1.0 if seg["audio"] == "original" else 1.2)

        # efectos según la entrada de cada segmento
        entrada = seg["entrada"]
        if entrada == "flash":
            poner(efectos["boom"], seg_inicio, 0.9)
        elif entrada == "glitch":
            poner(efectos["glitch"], seg_inicio, 0.5)
            poner(efectos["whoosh"], max(0, seg_inicio - 0.2), 0.5)
        elif entrada == "zoomblur":
            poner(efectos["whoosh"], max(0, seg_inicio - 0.25), 0.55)
            poner(efectos["golpe"], seg_inicio, 0.8)
        elif entrada == "barrido":
            poner(efectos["whoosh"], max(0, seg_inicio - 0.2), 0.75)
        for g in seg["golpes"]:
            if g > 0:
                poner(efectos["golpe"], seg_inicio + g / FPS, 0.55)
        if seg["tipo"] == "rebobinado":
            poner(efectos["rebobinar"], seg_inicio, 0.75)
        if seg["tipo"] == "congelado":
            poner(efectos["obturador"], seg_inicio, 0.9)
        if seg["id"] == "gancho":
            poner(efectos["subida"][-int(dur * SR):], seg_inicio, 0.45)
        inicio += n_frames

    # ritmo de fondo desde el tercer segmento, con fundido de salida
    inicio_ritmo = sum(frames_de(s) for s in linea["segmentos"][:2]) / FPS
    base = ritmo(dur_total - inicio_ritmo)
    salida = np.linspace(1, 0, int(1.5 * SR))
    base[-len(salida):] *= salida[:, None]
    poner(base, inicio_ritmo, 0.28)
    poner(efectos["ding"], dur_total - 0.9, 0.35)

    mezcla = np.tanh(mezcla[: int(dur_total * SR)] * 1.1)
    wav = os.path.join(tmp, "mezcla.wav")
    guardar_wav(wav, mezcla)
    ffmpeg("-i", wav, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), "-b:a", "256k",
           os.path.join(PUB, "banda-sonora.mp3"))

print(f"Listo: {len(linea['segmentos'])} segmentos, {total_frames} fotogramas ({dur_total:.2f} s)")
