/**
 * Soundtrack for video v3 (public/soundtrack-v3.wav): an original, uplifting
 * 128 BPM house track in A major (A - E - F#m - D), synthesized in code (no
 * samples, no rights). Bright house piano, four-on-the-floor, a warm piano-only
 * break for the "who I am" chapter.
 *
 * Arrangement (1 bar = 1.875 s), aligned with the v3 scenes:
 *   0-3    intro (florian.go): filtered piano, typing clicks; roll + riser on bar 3
 *   4-21   drop A (git log, pipeline, dashboard): lead from bar 8
 *   22     `exit`: no kick, filter closes, four key clicks
 *   23-26  break (trail title + the shy line): solo piano + pad, hook played softly
 *   27-28  build (the climb): kick comes back, roll + riser
 *   29-35  drop B (checkpoints, summit): the biggest part, crash on the summit (bar 34)
 *   36-37  tension (sudo hire florian): kick + hats, chime on "access granted"
 *   38-40  final drop
 *   41     final hit and tail
 *
 * Usage: node scripts/make-music-v3.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BPM = 128;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const S16 = BEAT / 4;
const BARS = 42;
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
let seed = 1287;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const put = (buf, i, v) => {
  if (i >= 0 && i < N) buf[i] += v;
};
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;

// A major: A - E - F#m - D (voiced around A4, four notes)
const CHORDS = [
  [57, 61, 64, 69],
  [56, 59, 64, 68],
  [57, 61, 66, 69],
  [57, 62, 66, 69],
];
const ROOTS = [45, 40, 42, 38];
// Lead hook, in 8ths (null = rest), one row per chord: rising, optimistic.
const LEAD = [
  [76, null, 76, 78, 81, null, 78, 76],
  [80, null, 78, 76, 71, null, 76, null],
  [78, null, 76, 78, 81, null, 85, 81],
  [83, null, 81, 78, 81, null, 76, 78],
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


/** Bright house piano: decaying harmonics, slight stretch, hammer noise. */
function piano(t0, midi, dur, g = 1, bright = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.35) * SR);
  const f = mtof(midi);
  const H = 7;
  const ph = new Float64Array(H);
  const pan = 0.5 + (midi - 64) / 60;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let v = 0;
    for (let h = 1; h <= H; h++) {
      ph[h - 1] += (2 * Math.PI * f * h * (1 + 0.0005 * h * h)) / SR;
      v += (Math.sin(ph[h - 1]) / h ** (1.6 - 0.5 * bright)) * Math.exp(-t * (1.5 + h * 1.1));
    }
    if (i < 220) v += (rand() * 2 - 1) * (1 - i / 220) * 0.25 * bright;
    const rel = t > dur ? Math.exp(-(t - dur) * 16) : 1;
    const env = Math.min(1, i / 25) * Math.exp(-t * (1.2 + midi / 60)) * rel * 0.11 * g;
    put(mL, s + i, v * env * (1.2 - pan));
    put(mR, s + i, v * env * (0.8 + pan));
    put(sL, s + i, v * env * 0.35);
    put(sR, s + i, v * env * 0.35);
  }
}

function pianoChord(t0, notes, dur, g = 1, bright = 1) {
  notes.forEach((m, k) => {
    piano(t0 + k * 0.004, m, dur, g * (k === notes.length - 1 ? 1 : 0.8), bright);
  });
}

/** Downward sweep for the `exit` bar. */
function sweepDown(t0, dur, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    lp += lpA(9000 * (1 - p) ** 2 + 200) * (rand() * 2 - 1 - lp);
    const v = lp * 0.22 * (1 - p) * g;
    put(dL, s + i, v * (0.5 + 0.5 * Math.cos(p * 18)));
    put(dR, s + i, v * (0.5 - 0.5 * Math.cos(p * 18)));
  }
}

// ---------------- arrangement ----------------

const isIntro = (b) => b < 4;
const isExit = (b) => b === 22;
const isBreak = (b) => b >= 23 && b <= 26;
const isBuild = (b) => b === 27 || b === 28;
const isTension = (b) => b === 36 || b === 37;
const hasLead = (b) => (b >= 8 && b < 21) || (b >= 29 && b < 36) || (b >= 38 && b < 41);
const ARP = [0, 1, 2, 3, 2, 1, 2, 3];
// House piano rhythm, in 16ths: syncopated, accent on the one.
const PIANO = [0, 3, 6, 10, 13];

for (let b = 0; b < BARS; b++) {
  const t = at(b);
  const ci = b % 4;
  const chord = CHORDS[ci];
  const up = chord.map((m) => m + 12);

  if (b === 41) {
    impact(t);
    pad(t, BAR, [...CHORDS[0], 73], 1.6, 2600);
    pianoChord(t, up, BAR * 0.8, 1.3, 1);
    for (let k = 0; k < 8; k++) pluck(t + k * S16 * 2, chord[k % 4] + 24, 3200, 1 - k / 8);
    continue;
  }

  // Pad everywhere, warmer in the break
  pad(t, BAR, chord, isBreak(b) ? 1.5 : isIntro(b) || isExit(b) ? 0.7 : 0.8, isBreak(b) ? 2200 : 1700);

  if (isBreak(b)) {
    // Solo piano: held chord, then the hook played gently in quarter notes
    bassNote(t, BAR, ROOTS[ci], 0.55, 160, 200);
    pianoChord(t, chord, BAR * 0.9, 0.9, 0.4);
    if (b >= 25) {
      LEAD[ci].forEach((m, k) => {
        if (m !== null && k % 2 === 0) piano(t + k * BEAT * 0.5, m, BEAT * 0.9, 0.75, 0.5);
      });
    }
    if (b === 26) riser(at(26, 2), BAR / 2, 0.5);
    continue;
  }

  // Piano stabs (filtered in the intro / exit / tension, open in the drops)
  const bright = isIntro(b) ? 0.2 + b * 0.2 : isExit(b) ? 0.3 : isTension(b) ? 0.4 : isBuild(b) ? 0.5 + (b - 27) * 0.3 : 1;
  for (const s16 of PIANO) pianoChord(t + s16 * S16, up, S16 * 1.6, s16 === 0 ? 1 : 0.8, bright);

  // Arp 16ths, quiet underneath
  if (!isIntro(b) && !isExit(b)) {
    for (let s = 0; s < 16; s++) pluck(t + s * S16, chord[ARP[s % 8]] + 12, isBuild(b) ? 1400 + (b - 27) * 1400 : 3600, 0.45);
  }

  // Typing clicks while the code types itself (bars 0-3), and `exit` on bar 22
  if (b < 4) {
    for (let s = 0; s < 32; s++) if (rand() < 0.5) keyClick(t + s * (S16 / 2) + rand() * 0.01, 0.6 + rand() * 0.4);
  }
  if (isExit(b)) {
    for (const fr of [4, 8, 12, 16, 22]) keyClick(t + fr / 30, 1);
    sweepDown(t, BAR, 1);
    for (let k = 0; k < 4; k++) hat(t + k * BEAT + BEAT / 2, true, 0.6);
    continue;
  }

  // Intro: soft kick on bars 2-3
  if (b === 2 || b === 3) kick(t, 0.6);

  // Build: kick on every beat, getting louder; claps join on bar 28
  if (isBuild(b)) {
    for (let k = 0; k < 4; k++) kick(t + k * BEAT, 0.6 + (b - 27) * 0.3 + k * 0.03);
    if (b === 28) {
      clap(t + BEAT, 0.8);
      clap(t + 3 * BEAT, 0.8);
    }
  }

  const full = !isIntro(b) && !isBuild(b) && !isTension(b);

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
    // House bass: on the offbeat, with an octave pickup
    const root = ROOTS[ci];
    for (let k = 0; k < 4; k++) {
      bassNote(t + k * BEAT + BEAT / 2, BEAT * 0.42, root, 1, 300, 1500);
      bassNote(t + k * BEAT + 3 * S16, S16 * 0.8, root + 12, 0.55, 300, 1500);
    }
  }

  if (hasLead(b)) {
    LEAD[ci].forEach((m, k) => {
      if (m !== null) lead(t + k * BEAT * 0.5, BEAT * 0.45, m, b >= 29 ? 1.15 : 1);
    });
  }
  // Summit: the piano doubles the hook an octave up
  if (b === 34 || b === 35) {
    LEAD[ci].forEach((m, k) => {
      if (m !== null) piano(t + k * BEAT * 0.5, m + 12, BEAT * 0.45, 0.6, 1);
    });
  }

  // Crashes on every drop and on the summit
  if ([4, 12, 18, 29, 34, 38].includes(b)) crash(t, 1);
  if (b === 29 || b === 38) impact(t, 0.6);
  // Fills: roll + riser before drops
  if (b === 3 || b === 37) {
    snareRoll(b, 1);
    riser(t, BAR, 1.1);
  }
  if (b === 27) riser(t, BAR * 2, 1.2);
  if (b === 28) snareRoll(b, 1.1);
  if ([11, 17, 33].includes(b)) snareRoll(b, 0.6);
  if (b === 37) chime(at(37, 2), 1);
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

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack-v3.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${out} (${((N / SR) | 0)}s)`);
