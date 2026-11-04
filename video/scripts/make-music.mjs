/**
 * Procedurally generates the soundtrack (public/soundtrack.wav):
 * an original synthwave/electro track at 120 BPM, so there are no rights to clear.
 *
 * The structure is aligned with the video timeline (1 bar = 2 s = 60 frames):
 *   bars 0-2   intro: filtered arp + riser
 *   bar  3     drop (the name reveal ends, "who I am" starts)
 *   bars 3-29  full groove, a lighter break at bars 19-22 (soft skills)
 *   bar  30    final hit, then a pad tail until the end (66 s)
 *
 * Usage: node scripts/make-music.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5 s
const BAR = BEAT * 4; // 2 s
const DURATION = 66;
const N = Math.floor(SR * DURATION);

const L = new Float32Array(N);
const R = new Float32Array(N);
/** Sidechain envelope: 1 = no ducking. Applied to bass and pads. */
const duck = new Float32Array(N).fill(1);

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
// Deterministic pseudo-random so every render sounds the same.
let seed = 1337;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

// A minor: Am - F - C - G, one chord per bar.
const CHORDS = [
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [48, 52, 55], // C
  [55, 59, 62], // G
];
const ROOTS = [45, 41, 36, 43];

const FINAL_BAR = 30;
const isBreak = (bar) => bar >= 19 && bar <= 22;
const hasDrums = (bar) => bar >= 3 && bar < FINAL_BAR;

function add(buf, i, v) {
  if (i >= 0 && i < N) buf[i] += v;
}

// ---------- instruments ----------

function kick(t0, gain = 1) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.45 * SR);
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 45 + 120 * Math.exp(-t * 35);
    phase += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 7);
    const click = i < 60 ? (1 - i / 60) * 0.4 : 0;
    const v = (Math.tanh(Math.sin(phase) * 2) * env + click) * 0.55 * gain;
    add(L, start + i, v);
    add(R, start + i, v);
  }
  // duck the other instruments
  const dl = Math.floor(0.3 * SR);
  for (let i = 0; i < dl; i++) {
    const k = start + i;
    if (k < N) duck[k] = Math.min(duck[k], 0.25 + 0.75 * (i / dl) ** 0.7);
  }
}

function clap(t0, gain = 1) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.25 * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    // three quick bursts, then a tail
    const burst =
      t < 0.03 ? Math.exp(-((t % 0.01) * 300)) : Math.exp(-(t - 0.03) * 18);
    const n = rand() * 2 - 1;
    lp += 0.5 * (n - lp);
    const hp = n - lp; // bright noise
    const v = hp * burst * 0.32 * gain;
    add(L, start + i, v * 0.9);
    add(R, start + i, v);
  }
}

function hat(t0, open = false, gain = 1) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor((open ? 0.18 : 0.05) * SR);
  let prev = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    const hp = n - prev;
    prev = n;
    const env = Math.exp(-t * (open ? 20 : 70));
    const v = hp * env * 0.09 * gain;
    add(L, start + i, v * 0.7);
    add(R, start + i, v);
  }
}

function bassNote(t0, dur, midi, gain = 1) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  const f = mtof(midi);
  let ph = 0;
  let ph2 = 0;
  let lp1 = 0;
  let lp2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph = (ph + f / SR) % 1;
    ph2 = (ph2 + (f * 1.005) / SR) % 1;
    const saw = (ph * 2 - 1 + (ph2 * 2 - 1)) * 0.5;
    const cutoff = 200 + 1400 * Math.exp(-t * 14);
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp1 += a * (saw - lp1);
    lp2 += a * (lp1 - lp2);
    const env = Math.min(1, i / 80) * Math.min(1, (len - i) / 200);
    const sub = Math.sin(2 * Math.PI * (f / 2) * t) * 0.5;
    const v = (lp2 + sub) * env * 0.33 * gain;
    add(L, start + i, v);
    add(R, start + i, v);
  }
}

/** Arp pluck, written to a separate send buffer for the delay. */
function pluck(t0, midi, cutoffBase, gain, sendL, sendR) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.22 * SR);
  const f = mtof(midi);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph = (ph + f / SR) % 1;
    const sq = ph < 0.5 ? 1 : -1;
    const saw = ph * 2 - 1;
    const osc = 0.6 * sq + 0.4 * saw;
    const cutoff = cutoffBase * (0.3 + Math.exp(-t * 25));
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (osc - lp);
    const env = Math.exp(-t * 14) * Math.min(1, i / 30);
    const v = lp * env * 0.11 * gain;
    add(L, start + i, v);
    add(R, start + i, v);
    add(sendL, start + i, v);
    add(sendR, start + i, v);
  }
}

/** Detuned saw pad on a separate buffer (ducked later). */
function pad(t0, dur, notes, gain, bufL, bufR) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  const voices = [];
  for (const m of notes) {
    for (const d of [-0.12, 0, 0.12]) {
      voices.push({ f: mtof(m + d), ph: rand(), pan: d / 0.24 + 0.5 });
    }
  }
  let lpL = 0;
  let lpR = 0;
  const a = 1 - Math.exp((-2 * Math.PI * 1800) / SR);
  for (let i = 0; i < len; i++) {
    let sL = 0;
    let sR = 0;
    for (const v of voices) {
      v.ph = (v.ph + v.f / SR) % 1;
      const s = v.ph * 2 - 1;
      sL += s * (1 - v.pan);
      sR += s * v.pan;
    }
    lpL += a * (sL - lpL);
    lpR += a * (sR - lpR);
    const env = Math.min(1, i / (0.15 * SR)) * Math.min(1, (len - i) / (0.1 * SR));
    add(bufL, start + i, lpL * env * 0.022 * gain);
    add(bufR, start + i, lpR * env * 0.022 * gain);
  }
}

function riser(t0, dur, gain = 1) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const n = rand() * 2 - 1;
    const cutoff = 300 + 9000 * p * p;
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (n - lp);
    const v = lp * p * p * 0.25 * gain;
    add(L, start + i, v * (0.5 + 0.5 * Math.sin(p * 20)));
    add(R, start + i, v * (0.5 - 0.5 * Math.sin(p * 20)));
  }
}

function impact(t0, gain = 1) {
  kick(t0, 1.3 * gain);
  const start = Math.floor(t0 * SR);
  const len = Math.floor(1.6 * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    lp += 0.08 * (n - lp);
    const v = lp * Math.exp(-t * 2.5) * 0.5 * gain;
    add(L, start + i, v);
    add(R, start + i, v);
  }
}

// ---------- arrangement ----------

const padL = new Float32Array(N);
const padR = new Float32Array(N);
const sendL = new Float32Array(N);
const sendR = new Float32Array(N);

for (let bar = 0; bar <= FINAL_BAR; bar++) {
  const t = bar * BAR;
  const ci = bar % 4;
  const chord = CHORDS[ci];

  if (bar === FINAL_BAR) {
    impact(t);
    pad(t, DURATION - t, [...CHORDS[0], 69], 1.4, padL, padR);
    for (let k = 0; k < 8; k++) {
      pluck(t + k * BEAT * 0.5, CHORDS[0][k % 3] + 24, 2500, 0.6 * (1 - k / 8), sendL, sendR);
    }
    break;
  }

  // Pads all along (quieter in the intro)
  pad(t, BAR, chord, bar < 3 ? 0.6 : isBreak(bar) ? 1.3 : 1, padL, padR);

  // Arp: 16ths, filter opens through the intro
  const intro = bar < 3;
  const cutoff = intro ? 500 + bar * 900 : isBreak(bar) ? 2200 : 3200;
  const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
  for (let s = 0; s < 16; s++) {
    const n = chord[pattern[s % 8]] + 12 + (s % 8 === 7 ? 12 : 0);
    pluck(t + s * BEAT * 0.25, n, cutoff, intro ? 0.8 : 1, sendL, sendR);
  }

  if (bar === 2) riser(t, BAR, 1.2);
  if (bar === 22 || bar === 29) riser(t + BAR / 2, BAR / 2, 0.8);

  if (hasDrums(bar)) {
    const light = isBreak(bar);
    for (let b = 0; b < 4; b++) {
      const bt = t + b * BEAT;
      if (!light || b === 0) kick(bt, light ? 0.7 : 1);
      if (b % 2 === 1 && !light) clap(bt);
      hat(bt + BEAT / 2, b === 3, light ? 0.6 : 1);
      if (!light) {
        hat(bt + BEAT / 4, false, 0.5);
        hat(bt + (3 * BEAT) / 4, false, 0.5);
      }
    }
    // little fill before every 4th bar
    if (bar % 4 === 3 && !light) {
      clap(t + 3.5 * BEAT, 0.6);
      clap(t + 3.75 * BEAT, 0.8);
    }

    // Bass: offbeat 8ths, octave jumps
    if (!light) {
      const root = ROOTS[ci];
      for (let e = 0; e < 8; e++) {
        const bt = t + e * BEAT * 0.5;
        const m = e % 2 === 1 ? root + 12 : root;
        bassNote(bt, BEAT * 0.45, m, e % 2 === 1 ? 1 : 0.8);
      }
    }
  }
}

// mix bass (already in L/R) -> apply sidechain to pads only + dotted-8th delay on arp
const delay = Math.floor(BEAT * 0.75 * SR);
for (let i = 0; i < N; i++) {
  L[i] += padL[i] * duck[i];
  R[i] += padR[i] * duck[i];
  if (i >= delay) {
    // ping-pong
    sendL[i] += sendR[i - delay] * 0.45;
    sendR[i] += sendL[i - delay] * 0.45;
    L[i] += sendR[i - delay] * 0.35;
    R[i] += sendL[i - delay] * 0.35;
  }
}

// master: fade out last second, soft clip, normalize
const fadeStart = N - SR * 1.5;
let peak = 0;
for (let i = 0; i < N; i++) {
  const f = i > fadeStart ? 1 - (i - fadeStart) / (N - fadeStart) : 1;
  L[i] = Math.tanh(L[i] * 1.2) * f;
  R[i] = Math.tanh(R[i] * 1.2) * f;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;

// ---------- WAV writer ----------
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${out} (${DURATION}s)`);
