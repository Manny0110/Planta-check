"""
Genera audio PROVISIONAL sintetizado (sin muestras de terceros, sin derechos de autor ajenos).
Reemplace estos archivos por música y efectos con licencia comercial cuando los tenga.

Uso:  python3 scripts/generar-audio-provisional.py
Salida: public/assets/audio/{musica,whoosh,pop,cierre}.mp3
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "audio")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def save(name: str, data: np.ndarray) -> None:
    data = data / max(1e-9, np.max(np.abs(data))) * 0.89
    if data.ndim == 1:
        data = np.stack([data, data], axis=1)
    pcm = (data * 32767).astype(np.int16)
    wav_path = os.path.join(OUT, name + ".wav")
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-b:a", "192k",
         os.path.join(OUT, name + ".mp3")],
        check=True,
    )
    os.remove(wav_path)


def t_axis(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def lowpass(x: np.ndarray, alpha: np.ndarray | float) -> np.ndarray:
    y = np.zeros_like(x)
    a = np.broadcast_to(alpha, x.shape)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


# ---------- whoosh: ruido filtrado con barrido ----------
t = t_axis(0.6)
noise = rng.normal(0, 1, len(t))
sweep = 0.02 + 0.35 * np.sin(np.pi * t / t[-1]) ** 2
w = lowpass(noise, sweep) - lowpass(noise, sweep * 0.15)
env = np.sin(np.pi * np.clip(t / 0.6, 0, 1)) ** 1.5
left = w * env * (1 - t / 0.6 * 0.6)
right = w * env * (0.4 + t / 0.6 * 0.6)
save("whoosh", np.stack([left, right], axis=1))

# ---------- pop: burbuja suave ----------
t = t_axis(0.18)
freq = 900 * np.exp(-t * 18) + 380
phase = 2 * np.pi * np.cumsum(freq) / SR
pop = np.sin(phase) * np.exp(-t * 28)
save("pop", pop)

# ---------- cierre: campanita arpegiada (Do mayor) ----------
t = t_axis(2.2)
chime = np.zeros_like(t)
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    start = k * 0.09
    tt = np.clip(t - start, 0, None)
    on = (t >= start).astype(float)
    chime += on * (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.01 * tt)) * np.exp(-tt * 2.6)
save("cierre", chime)

# ---------- música: pop instrumental 120 BPM, 20 s ----------
DUR = 20.0
t = t_axis(DUR)
beat = 0.5
music = np.zeros((len(t), 2))

# progresión Do - Sol - Lam - Fa (2 s por acorde)
chords = [
    [261.63, 329.63, 392.00],
    [196.00, 246.94, 293.66],
    [220.00, 261.63, 329.63],
    [174.61, 220.00, 261.63],
]
bass_roots = [65.41, 49.00, 55.00, 43.65]
for i in range(int(DUR / 2)):
    s, e = int(i * 2 * SR), int((i + 1) * 2 * SR)
    seg = t[s:e] - t[s]
    ch = chords[i % 4]
    pad = sum(np.sin(2 * np.pi * f * seg) + 0.3 * np.sin(2 * np.pi * f * 2 * seg + 0.3) for f in ch)
    pad *= np.minimum(1, seg / 0.08) * (0.75 + 0.25 * np.cos(2 * np.pi * seg / beat))
    music[s:e, 0] += pad * 0.09
    music[s:e, 1] += pad * 0.09
    # bajo en corcheas
    for n in range(8):
        bs = s + int(n * beat / 2 * SR)
        be = min(e, bs + int(0.22 * SR))
        bt = t[bs:be] - t[bs]
        b = np.sin(2 * np.pi * bass_roots[i % 4] * 2 * bt) * np.exp(-bt * 9)
        music[bs:be] += (b * 0.35)[:, None]
    # arpegio brillante
    for n in range(8):
        ns = s + int(n * beat / 2 * SR)
        ne = min(e, ns + int(0.2 * SR))
        nt = t[ns:ne] - t[ns]
        f = ch[n % 3] * 2
        a = np.sin(2 * np.pi * f * nt) * np.exp(-nt * 14) * 0.12
        pan = 0.3 if n % 2 else 0.7
        music[ns:ne, 0] += a * (1 - pan)
        music[ns:ne, 1] += a * pan

n_beats = int(DUR / beat)
for b in range(n_beats):
    s = int(b * beat * SR)
    # bombo
    kt = t_axis(0.3)
    kick = np.sin(2 * np.pi * (50 + 110 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 9)
    e = min(len(t), s + len(kt))
    music[s:e] += (kick[: e - s] * 0.6)[:, None]
    # hi-hat a contratiempo
    hs = s + int(beat / 2 * SR)
    ht = t_axis(0.05)
    hat = rng.normal(0, 1, len(ht))
    hat = (hat - lowpass(hat, 0.5)) * np.exp(-ht * 90) * 0.18
    he = min(len(t), hs + len(ht))
    if hs < len(t):
        music[hs:he] += hat[: he - hs][:, None]
    # palmada en tiempos 2 y 4
    if b % 2 == 1:
        ct = t_axis(0.12)
        clap = lowpass(rng.normal(0, 1, len(ct)), 0.35) * np.exp(-ct * 30) * 0.35
        ce = min(len(t), s + len(ct))
        music[s:ce] += clap[: ce - s][:, None]

save("musica", music)
print("Audio provisional generado en", os.path.abspath(OUT))
