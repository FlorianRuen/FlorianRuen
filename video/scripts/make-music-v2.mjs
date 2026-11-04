/**
 * Soundtrack for video v2 (public/soundtrack-v2.wav): an original, punchier
 * 128 BPM electro track in F minor, synthesized in code (no samples, no rights).
 *
 * Arrangement (1 bar = 1.875 s), aligned with the v2 scenes:
 *   0-3    intro: typing clicks, pad, opening arp; snare roll + riser on bar 3
 *   4-17   drop A (git log, CI pipeline): rolling bass, stabs, lead from bar 8
 *   18-19  break (kubectl apply): pad + arp only, roll + riser on bar 19
 *   20-29  drop B (cluster, dashboard)
 *   30-31  tension (sudo hire florian): kick + hats only, chime on "access granted"
 *   32-34  final drop
 *   35     final hit and tail
 *
 * Usage: node scripts/make-music-v2.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BPM = 128;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const S16 = BEAT / 4;
const BARS = 36;
const N = Math.ceil(SR * BARS * BAR);

const dL = new Float32Array(N); // drums (not ducked)
const dR = new Float32Array(N);
const mL = new Float32Array(N); // music bus (ducked by the kick)
const mR = new Float32Array(N);
const sL = new Float32Array(N); // delay send
const sR = new Float32Array(N);
const duck = new Float32Array(N).fill(1);

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const lpA = (fc) => 1 - Math.exp((-2 * Math.PI * Math.min(fc, SR * 0.45)) / SR);
let seed = 4242;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const put = (buf, i, v) => {
  if (i >= 0 && i < N) buf[i] += v;
};
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;

// F minor: Fm - Db - Ab - Eb
const CHORDS = [
  [53, 56, 60],
  [49, 53, 56],
  [51, 56, 60],
  [51, 55, 58],
];
const ROOTS = [41, 37, 44, 39];
// Lead hook, in 8ths (null = rest), one row per chord.
const LEAD = [
  [72, null, 68, 72, 75, null, 72, 68],
  [73, null, 72, 68, 65, null, 68, null],
  [72, null, 75, 72, 77, null, 75, 72],
  [70, null, 75, 79, 77, null, 75, 70],
];

// ---------------- drums ----------------

function kick(t0, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.42 * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (48 + 170 * Math.exp(-t * 42))) / SR;
    const body = Math.tanh(Math.sin(ph) * 3) * Math.exp(-t * 6.5);
    const click = i < 90 ? (rand() * 2 - 1) * (1 - i / 90) * 0.5 : 0;
    const v = (body + click) * 0.6 * g;
    put(dL, s + i, v);
    put(dR, s + i, v);
  }
  const dl = Math.floor(0.26 * SR);
  for (let i = 0; i < dl; i++) {
    const k = s + i;
    if (k < N) duck[k] = Math.min(duck[k], 0.15 + 0.85 * (i / dl) ** 0.6);
  }
}

function clap(t0, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.3 * SR);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = t < 0.025 ? Math.exp(-((t % 0.008) * 350)) : Math.exp(-(t - 0.025) * 16);
    const n = rand() * 2 - 1;
    lp += 0.45 * (n - lp);
    ph += (2 * Math.PI * 190) / SR;
    const tone = Math.sin(ph) * Math.exp(-t * 30) * 0.5;
    const v = ((n - lp) * env * 0.4 + tone) * g;
    put(dL, s + i, v);
    put(dR, s + i, v * 0.92);
  }
}

function snare(t0, g = 1, pitch = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.12 * SR);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    lp += 0.5 * (n - lp);
    ph += (2 * Math.PI * 210 * pitch) / SR;
    const v = ((n - lp) * 0.35 + Math.sin(ph) * 0.4) * Math.exp(-t * 28) * g;
    put(dL, s + i, v);
    put(dR, s + i, v);
  }
}

function hat(t0, open = false, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((open ? 0.2 : 0.045) * SR);
  let prev = 0;
  const pan = open ? 0.6 : 0.45 + rand() * 0.2;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    const hp = n - prev;
    prev = n;
    const v = hp * Math.exp(-t * (open ? 16 : 80)) * 0.1 * g;
    put(dL, s + i, v * (1 - pan) * 2);
    put(dR, s + i, v * pan * 2);
  }
}

function crash(t0, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(2.2 * SR);
  let pl = 0;
  let pr = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const a = rand() * 2 - 1;
    const b = rand() * 2 - 1;
    const env = Math.exp(-t * 2.2) * 0.13 * g;
    put(dL, s + i, (a - pl) * env);
    put(dR, s + i, (b - pr) * env);
    pl = a;
    pr = b;
  }
}

function snareRoll(bar, g = 1) {
  // 8ths, then 16ths, then 32nds over the last beat, rising.
  const hits = [];
  for (let k = 0; k < 4; k++) hits.push(k * 0.5);
  for (let k = 0; k < 4; k++) hits.push(2 + k * 0.25);
  for (let k = 0; k < 8; k++) hits.push(3 + k * 0.125);
  hits.forEach((b, i) => {
    const p = i / hits.length;
    snare(at(bar, b), (0.25 + 0.75 * p) * g, 1 + p * 0.8);
  });
}

// ---------------- synths ----------------

function bassNote(t0, dur, midi, g = 1, cutBase = 260, cutEnv = 1900) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  const f = mtof(midi);
  let p1 = 0;
  let p2 = 0;
  let a1 = 0;
  let a2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    p1 = (p1 + f / SR) % 1;
    p2 = (p2 + (f * 1.007) / SR) % 1;
    const osc = (p1 * 2 - 1) * 0.6 + (p2 < 0.5 ? 0.4 : -0.4);
    const a = lpA(cutBase + cutEnv * Math.exp(-t * 18));
    a1 += a * (osc - a1);
    a2 += a * (a1 - a2);
    const env = Math.min(1, i / 60) * Math.min(1, (len - i) / 150);
    const sub = Math.sin(2 * Math.PI * (f / 2) * t) * 0.6;
    const v = (a2 + sub) * env * 0.36 * g;
    put(mL, s + i, v);
    put(mR, s + i, v);
  }
}

function saws(notes, detune = [-0.11, 0, 0.11]) {
  const voices = [];
  for (const m of notes) {
    for (const d of detune) {
      voices.push({ f: mtof(m + d), ph: rand(), pan: detune.length > 1 ? (d - detune[0]) / (detune[detune.length - 1] - detune[0]) : 0.5 });
    }
  }
  return voices;
}

function stab(t0, notes, cutoff, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.2 * SR);
  const vs = saws(notes);
  let lL = 0;
  let lR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let a = 0;
    let b = 0;
    for (const v of vs) {
      v.ph = (v.ph + v.f / SR) % 1;
      const x = v.ph * 2 - 1;
      a += x * (1 - v.pan);
      b += x * v.pan;
    }
    const c = lpA(cutoff * (0.35 + Math.exp(-t * 18)));
    lL += c * (a - lL);
    lR += c * (b - lR);
    const env = Math.exp(-t * 11) * Math.min(1, i / 40) * 0.05 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
  }
}

function pad(t0, dur, notes, g = 1, cutoff = 1600) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  const vs = saws(notes, [-0.14, -0.05, 0.05, 0.14]);
  let lL = 0;
  let lR = 0;
  const c = lpA(cutoff);
  for (let i = 0; i < len; i++) {
    let a = 0;
    let b = 0;
    for (const v of vs) {
      v.ph = (v.ph + v.f / SR) % 1;
      const x = v.ph * 2 - 1;
      a += x * (1 - v.pan);
      b += x * v.pan;
    }
    lL += c * (a - lL);
    lR += c * (b - lR);
    const env = Math.min(1, i / (0.12 * SR)) * Math.min(1, (len - i) / (0.08 * SR)) * 0.016 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
  }
}

function pluck(t0, midi, cutoff, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.2 * SR);
  const f = mtof(midi);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph = (ph + f / SR) % 1;
    const osc = (ph < 0.5 ? 0.6 : -0.6) + (ph * 2 - 1) * 0.4;
    lp += lpA(cutoff * (0.3 + Math.exp(-t * 26))) * (osc - lp);
    const v = lp * Math.exp(-t * 15) * Math.min(1, i / 30) * 0.09 * g;
    put(mL, s + i, v);
    put(mR, s + i, v);
    put(sL, s + i, v * 0.7);
    put(sR, s + i, v * 0.7);
  }
}

function lead(t0, dur, midi, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.08) * SR);
  const vs = saws([midi], [-0.09, 0, 0.09]);
  const sub = { f: mtof(midi - 12), ph: 0 };
  let lL = 0;
  let lR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const vib = 1 + (t > 0.12 ? Math.sin(t * 2 * Math.PI * 5.5) * 0.004 : 0);
    let a = 0;
    let b = 0;
    for (const v of vs) {
      v.ph = (v.ph + (v.f * vib) / SR) % 1;
      const x = v.ph * 2 - 1;
      a += x * (1 - v.pan);
      b += x * v.pan;
    }
    sub.ph = (sub.ph + sub.f / SR) % 1;
    const sq = sub.ph < 0.5 ? 0.5 : -0.5;
    const c = lpA(2800 + 3200 * Math.exp(-t * 8));
    lL += c * (a + sq - lL);
    lR += c * (b + sq - lR);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.08) : 1;
    const env = Math.min(1, i / 120) * (0.75 + 0.25 * Math.exp(-t * 6)) * rel * 0.05 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
    put(sL, s + i, lL * env * 0.6);
    put(sR, s + i, lR * env * 0.6);
  }
}

function riser(t0, dur, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const n = rand() * 2 - 1;
    lp += lpA(300 + 10000 * p * p) * (n - lp);
    ph += (2 * Math.PI * (200 + 1200 * p * p)) / SR;
    const v = (lp * 0.25 + Math.sin(ph) * 0.05) * p * p * g;
    put(dL, s + i, v * (0.5 + 0.5 * Math.sin(p * 24)));
    put(dR, s + i, v * (0.5 - 0.5 * Math.sin(p * 24)));
  }
}

function impact(t0, g = 1) {
  kick(t0, 1.4 * g);
  crash(t0, 1.3 * g);
  const s = Math.floor(t0 * SR);
  const len = Math.floor(1.5 * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (30 + 60 * Math.exp(-t * 3))) / SR;
    const v = Math.sin(ph) * Math.exp(-t * 2.2) * 0.45 * g;
    put(dL, s + i, v);
    put(dR, s + i, v);
  }
}

function keyClick(t0, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.018 * SR);
  let prev = 0;
  const pan = 0.3 + rand() * 0.4;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    const v = ((n - prev) * 0.5 + Math.sin(2 * Math.PI * 2400 * t) * 0.3) * Math.exp(-t * 260) * 0.22 * g;
    prev = n;
    put(dL, s + i, v * (1 - pan) * 2);
    put(dR, s + i, v * pan * 2);
  }
}

function chime(t0, g = 1) {
  for (const [dt, f] of [
    [0, 1046.5],
    [0.09, 1568],
  ]) {
    const s = Math.floor((t0 + dt) * SR);
    const len = Math.floor(0.9 * SR);
    for (let i = 0; i < len; i++) {
      const t = i / SR;
      const v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * Math.exp(-t * 5) * 0.12 * g;
      put(mL, s + i, v);
      put(mR, s + i, v);
      put(sL, s + i, v * 0.5);
      put(sR, s + i, v * 0.5);
    }
  }
}

// ---------------- arrangement ----------------

const isIntro = (b) => b < 4;
const isBreak = (b) => b === 18 || b === 19;
const isTension = (b) => b === 30 || b === 31;
const hasLead = (b) => (b >= 8 && b < 17) || (b >= 20 && b < 29) || (b >= 32 && b < 35);
const ARP = [0, 1, 2, 1, 2, 0, 1, 2];

for (let b = 0; b < BARS; b++) {
  const t = at(b);
  const ci = b % 4;
  const chord = CHORDS[ci];

  if (b === 35) {
    impact(t);
    pad(t, BAR, [...CHORDS[0], 65], 1.6, 2200);
    for (let k = 0; k < 8; k++) pluck(t + k * S16 * 2, CHORDS[0][k % 3] + 24, 3000, 1 - k / 8);
    continue;
  }

  // Pad everywhere (louder in the break)
  pad(t, BAR, chord, isIntro(b) ? 0.7 : isBreak(b) ? 1.6 : 0.8, isBreak(b) ? 2400 : 1600);

  // Arp 16ths
  const arpCut = isIntro(b) ? 500 + b * 900 : isBreak(b) ? 2600 : 3400;
  for (let s = 0; s < 16; s++) {
    pluck(t + s * S16, chord[ARP[s % 8]] + 12 + (s % 8 === 7 ? 12 : 0), arpCut, isIntro(b) ? 0.8 : 0.7);
  }

  // Typing clicks while the code types itself (bars 0-3)
  if (b < 4) {
    for (let s = 0; s < 32; s++) {
      if (rand() < 0.55) keyClick(t + s * (S16 / 2) + rand() * 0.01, 0.6 + rand() * 0.4);
    }
  }

  // Intro: soft kick on bar 2-3 beat 1, filtered stabs
  if (b === 2 || b === 3) {
    kick(t, 0.6);
    for (let k = 0; k < 4; k++) stab(t + (k + 0.5) * BEAT, chord.map((m) => m + 12), 700 + b * 300, 0.8);
  }

  // Break: long filtered bass notes
  if (isBreak(b)) bassNote(t, BAR, ROOTS[ci], 0.8, 180, 300);

  const full = !isIntro(b) && !isBreak(b) && !isTension(b);

  if (full || isTension(b)) {
    for (let k = 0; k < 4; k++) {
      const bt = t + k * BEAT;
      kick(bt);
      hat(bt + BEAT / 2, true, isTension(b) ? 0.7 : 1);
      for (let s = 0; s < 4; s++) if (s !== 2) hat(bt + s * S16, false, s === 0 ? 0.5 : 0.35 + rand() * 0.25);
    }
  }

  if (full) {
    clap(t + BEAT);
    clap(t + 3 * BEAT);
    // Rolling bass: off-16ths, octave on the third
    const root = ROOTS[ci];
    for (let k = 0; k < 4; k++) {
      for (let s = 1; s < 4; s++) {
        bassNote(t + k * BEAT + s * S16, S16 * 0.9, s === 2 ? root + 12 : root, s === 2 ? 1 : 0.85);
      }
    }
    // Offbeat chord stabs
    for (let k = 0; k < 4; k++) stab(t + (k + 0.5) * BEAT, chord.map((m) => m + 12), 3200, 1);
  }

  if (isTension(b)) {
    for (let k = 0; k < 4; k++) stab(t + (k + 0.5) * BEAT, chord.map((m) => m + 12), 900 + (b - 30) * 900, 0.8);
  }

  if (hasLead(b)) {
    LEAD[ci].forEach((m, k) => {
      if (m !== null) lead(t + k * BEAT * 0.5, BEAT * 0.45, m, 1);
    });
  }

  // Crashes on every drop
  if ([4, 12, 20, 32].includes(b)) crash(t, 1);
  // Fills: roll + riser before drops
  if ([3, 19, 31].includes(b)) {
    snareRoll(b, 1);
    riser(t, BAR, 1.1);
  }
  if ([11, 17, 29].includes(b)) {
    snareRoll(b, 0.6);
  }
  if (b === 31) chime(at(31, 2), 1);
}

// ---------------- mix ----------------
const delay = Math.floor(BEAT * 0.75 * SR);
for (let i = delay; i < N; i++) {
  sL[i] += sR[i - delay] * 0.4;
  sR[i] += sL[i - delay] * 0.4;
}
let peak = 0;
const L = new Float32Array(N);
const R = new Float32Array(N);
const fadeStart = N - Math.floor(SR * 1.2);
for (let i = 0; i < N; i++) {
  const wetL = i >= delay ? sR[i - delay] * 0.35 : 0;
  const wetR = i >= delay ? sL[i - delay] * 0.35 : 0;
  const f = i > fadeStart ? 1 - (i - fadeStart) / (N - fadeStart) : 1;
  L[i] = Math.tanh((dL[i] + (mL[i] + wetL) * duck[i]) * 1.3) * f;
  R[i] = Math.tanh((dR[i] + (mR[i] + wetR) * duck[i]) * 1.3) * f;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;

const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(L[i] * norm * 32767), i * 4);
  data.writeInt16LE(Math.round(R[i] * norm * 32767), i * 4 + 2);
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

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack-v2.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${out} (${((N / SR) | 0)}s)`);
