"""
Prepara los medios del reel a partir de public/fuente/original.mp4 y src/timeline.json:

  public/fuente/hd.mp4           original escalado a 1080 × 1920 (lanczos + enfoque suave)
  public/fuente/rebobinado.mp4   tramo en reversa y acelerado
  public/fuente/congelado.png    cuadro congelado
  public/banda-sonora.mp3        audio original editado + música y efectos SINTETIZADOS, a -14 LUFS

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
ORIGINAL = os.path.join(PUB, "fuente", "original.mp4")
HD = os.path.join(PUB, "fuente", "hd.mp4")
SR = 44100
rng = np.random.default_rng(5)

linea = json.load(open(os.path.join(RAIZ, "src", "timeline.json")))
FPS = linea["fps"]
segs = linea["segmentos"]


def frames_de(s):
    return s["frames"] if "frames" in s else round((s["hasta"] - s["desde"]) / s["velocidad"] * FPS)


# Mismo cálculo que src/linea.ts: cada segmento empieza `traslape` fotogramas antes del final del anterior.
inicios = []
for i, s in enumerate(segs):
    inicios.append(0 if i == 0 else inicios[-1] + frames_de(segs[i - 1]) - s["traslape"])
TOTAL = inicios[-1] + frames_de(segs[-1])
DUR = TOTAL / FPS


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def leer_wav(ruta):
    with wave.open(ruta) as w:
        d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return d.reshape(-1, w.getnchannels())


def guardar_wav(ruta, d):
    d = np.clip(d, -1, 1)
    if d.ndim == 1:
        d = np.stack([d, d], axis=1)
    with wave.open(ruta, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((d * 32767).astype(np.int16).tobytes())


def t(seg):
    return np.arange(int(seg * SR)) / SR


def pasa_bajos(x, a):
    y = np.zeros_like(x)
    acc = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def norm(x, p=0.9):
    return x / max(1e-9, np.max(np.abs(x))) * p


# ------------------------------------------------------------------ video
ffmpeg("-i", ORIGINAL, "-vf", "scale=1080:1920:flags=lanczos,hqdn3d=1.5:1.5:3:3,unsharp=5:5:0.7:5:5:0",
       "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", "-an", HD)
for s in segs:
    if s["tipo"] == "rebobinado":
        factor = (s["hasta"] - s["desde"]) / (frames_de(s) / FPS)
        ffmpeg("-ss", str(s["desde"]), "-t", str(s["hasta"] - s["desde"]), "-i", HD,
               "-vf", f"reverse,setpts=PTS/{factor:.4f},fps={FPS}", "-an", "-c:v", "libx264", "-crf", "14",
               "-pix_fmt", "yuv420p", os.path.join(PUB, "fuente", "rebobinado.mp4"))
    if s["tipo"] == "congelado":
        ffmpeg("-ss", str(s["desde"]), "-i", HD, "-frames:v", "1", os.path.join(PUB, "fuente", "congelado.png"))

# ------------------------------------------------------------------ sonidos sintetizados
def latido():
    tt = t(0.5)
    golpe = lambda d: np.sin(2 * np.pi * (48 + 40 * np.exp(-np.clip(tt - d, 0, None) * 30)) * np.clip(tt - d, 0, None)) * np.exp(-np.clip(tt - d, 0, None) * 14) * (tt >= d)
    return norm(golpe(0) + 0.7 * golpe(0.16))


def whoosh(dur=0.6):
    tt = t(dur)
    r = rng.normal(0, 1, len(tt))
    a = 0.02 + 0.3 * np.sin(np.pi * tt / dur) ** 2
    w = pasa_bajos(r, a) - pasa_bajos(r, a * 0.12)
    return norm(w * np.sin(np.pi * tt / dur) ** 1.6)


def subida(dur):
    tt = t(dur)
    r = rng.normal(0, 1, len(tt))
    a = 0.01 + 0.25 * (tt / dur) ** 2
    s = pasa_bajos(r, a) - pasa_bajos(r, a * 0.1)
    return norm(s * (tt / dur) ** 2)


def boom_calido():
    tt = t(2.5)
    sub = np.sin(2 * np.pi * np.cumsum(42 + 60 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 1.8)
    brillo = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.2) for f in (1046.5, 1318.5, 1568.0, 2093.0)) * 0.12
    return norm(np.tanh(1.6 * sub) + brillo)


def rebobinar(dur):
    tt = t(dur)
    f = 900 * np.exp(-tt * 1.4) * (1 + 0.06 * np.sin(2 * np.pi * 14 * tt))
    fase = 2 * np.pi * np.cumsum(f) / SR
    x = pasa_bajos(2 * ((fase / (2 * np.pi)) % 1) - 1, 0.18) + 0.2 * pasa_bajos(rng.normal(0, 1, len(tt)), 0.3)
    return norm(x * np.minimum(1, (dur - tt) * 10) * np.minimum(1, tt * 30))


def piano(f, dur=1.6):
    tt = t(dur)
    x = sum((1 / k) * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (2.2 + k * 0.9)) for k in (1, 2, 3, 4))
    return x * np.minimum(1, tt * 400)


def musica(dur, bpm=84):
    """Piano y colchón suaves (Do - Sol - Lam - Fa)."""
    n = int(dur * SR)
    out = np.zeros((n, 2))
    pulso = 60 / bpm
    acordes = [[261.63, 329.63, 392.0], [246.94, 293.66, 392.0], [261.63, 329.63, 440.0], [261.63, 349.23, 440.0]]
    bajos = [65.41, 49.0, 55.0, 43.65]
    patron = [0, 1, 2, 1, 0, 1, 2, 1]
    for c in range(int(dur / (pulso * 4)) + 1):
        acorde = acordes[c % 4]
        i0 = int(c * 4 * pulso * SR)
        if i0 >= n:
            break
        # colchón
        largo = min(n - i0, int(4 * pulso * SR))
        tt = np.arange(largo) / SR
        pad = sum(np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.003 * tt) for f in acorde)
        env = np.minimum(1, tt / 0.6) * np.minimum(1, (largo / SR - tt) / 0.4)
        out[i0 : i0 + largo] += (pad * env * 0.03)[:, None]
        b = piano(bajos[c % 4] * 2, 2.5) * 0.5
        e = min(n, i0 + len(b))
        out[i0:e] += b[: e - i0][:, None]
        # arpegio de piano en corcheas
        for k, idx in enumerate(patron):
            ik = i0 + int(k * pulso / 2 * SR)
            if ik >= n:
                break
            nota = piano(acorde[idx] * (2 if k in (2, 6) else 1)) * 0.22
            e = min(n, ik + len(nota))
            pan = 0.35 if k % 2 else 0.65
            out[ik:e, 0] += nota[: e - ik] * (1 - pan)
            out[ik:e, 1] += nota[: e - ik] * pan
    return out


# ------------------------------------------------------------------ mezcla
mezcla = np.zeros((int(DUR * SR) + SR, 2))


def poner(d, seg, vol):
    if d.ndim == 1:
        d = np.stack([d, d], axis=1)
    i = int(seg * SR)
    e = min(len(mezcla), i + len(d))
    if 0 <= i < len(mezcla):
        mezcla[i:e] += d[: e - i] * vol


seg_de = {s["id"]: (s, inicios[k] / FPS, frames_de(s) / FPS) for k, s in enumerate(segs)}

with tempfile.TemporaryDirectory() as tmp:
    for s, ini, dur in seg_de.values():
        if s["tipo"] != "video" or s["audio"] == "silencio":
            continue
        pieza = os.path.join(tmp, f"{s['id']}.wav")
        v = s["velocidad"]
        filtro = f"asetrate={SR}*{v},aresample={SR}" if s["audio"] == "lento" else (f"atempo={v}" if v != 1 else "anull")
        ffmpeg("-ss", str(s["desde"]), "-t", str(s["hasta"] - s["desde"]), "-i", ORIGINAL, "-vn", "-af", filtro,
               "-ar", str(SR), "-ac", "2", pieza)
        a = leer_wav(pieza)[: int(dur * SR)]
        f = max(1, int((s["traslape"] / FPS if s["traslape"] else 0.012) * SR))
        f = min(f, len(a) // 3)
        a[:f] *= np.linspace(0, 1, f)[:, None]
        a[-f:] *= np.linspace(1, 0, f)[:, None]
        poner(a, ini, 0.55)

    # --- gancho: latidos que se aceleran + subida hasta el congelado
    g, g0, gdur = seg_de["gancho"]
    _, p0, pdur = seg_de["patada"]
    _, c0, cdur = seg_de["congelado"]
    _, r0, rdur = seg_de["rebobinado"]
    momento = g0
    paso = 0.75
    while momento < c0 - 0.1:
        poner(latido(), momento, 0.9)
        momento += paso
        paso = max(0.42, paso * 0.86)
    poner(subida(c0 - g0), g0, 0.35)
    poner(latido(), c0, 1.0)
    poner(whoosh(0.5), p0, 0.4)
    poner(rebobinar(rdur + 0.1), r0, 0.55)

    # --- historia: música desde "inicio"
    _, i0, _ = seg_de["inicio"]
    poner(whoosh(0.5), i0 - 0.25, 0.4)
    m = musica(DUR - i0)
    _, t0, tdur = seg_de["tension"]
    _, pe0, pedur = seg_de["penal"]
    # la música baja durante la tensión y el penal, y vuelve con la atajada
    curva = np.ones(len(m))
    tt = np.arange(len(m)) / SR + i0
    atajada = pe0 + seg_de["penal"][0]["golpes"][0] / FPS
    curva = np.where(tt >= t0, np.interp(tt, [t0, t0 + 0.5, atajada - 0.05, atajada], [1, 0.25, 0.25, 1.15]), curva)
    salida = np.clip((DUR - tt) / 1.6, 0, 1)
    poner(m * (curva * salida)[:, None], i0, 0.75)

    # --- tensión y penal
    for k in range(4):
        poner(latido(), t0 + k * 0.45, 0.8)
    poner(whoosh(0.7), pe0 - 0.1, 0.6)
    poner(subida(atajada - pe0), pe0, 0.4)
    poner(boom_calido(), atajada, 0.9)

    mezcla = np.tanh(mezcla[: int(DUR * SR)] * 1.05)
    wav = os.path.join(tmp, "mezcla.wav")
    guardar_wav(wav, mezcla)
    ffmpeg("-i", wav, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), "-b:a", "256k",
           os.path.join(PUB, "banda-sonora.mp3"))

print(f"Listo: {len(segs)} segmentos, {TOTAL} fotogramas ({DUR:.2f} s)")
