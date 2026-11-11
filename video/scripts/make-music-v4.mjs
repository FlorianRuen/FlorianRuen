/**
 * Soundtrack for video v4 (public/soundtrack-v4.wav): an original cinematic
 * build at 100 BPM in B minor (Bm - G - D - A), synthesized in code (no
 * samples, no rights). Piano and pad to open, strings swelling with each
 * chapter, a breakdown for "who I am", a big drop for "what's next", a
 * heartbeat under `sudo hire florian`, a calm resolve for the outro.
 *
 * Arrangement (1 bar = 2.4 s), aligned with the v4 scenes:
 *   0-3    hook: pad, solo piano (a chord on the name, one per role), riser on bar 3
 *   4-7    the spark: piano arpeggio, strings enter, soft kick on 1 and 3, bell on the award
 *   8-11   scale: strings ostinato, bass, kick four-on-the-floor, claps
 *   12-15  the platform: 16th ostinato, hats, lead counter-melody, bell on the promotion
 *   16-20  who I am: breakdown, solo piano + warm pad, three piano hits, roll + riser on bar 20
 *   21-25  what's next: the drop, full drums, brass stack, lead hook, an impact per bar
 *   26     closing line: half-time, sustained chord
 *   27-28  sudo: heartbeat kick, filtered pad, chime on "access granted" (bar 28.5)
 *   29-31  outro: final impact, piano + strings resolve, tail
 *
 * Usage: node scripts/make-music-v4.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const S16 = BEAT / 4;
const BARS = 32;
const N = Math.ceil(SR * BARS * BAR);

const dL = new Float32Array(N); // drums (not ducked)
const dR = new Float32Array(N);
const mL = new Float32Array(N); // music bus (ducked by the kick)
const mR = new Float32Array(N);
const sL = new Float32Array(N); // reverb/delay send
const sR = new Float32Array(N);
const duck = new Float32Array(N).fill(1);

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const lpA = (fc) => 1 - Math.exp((-2 * Math.PI * Math.min(fc, SR * 0.45)) / SR);
let seed = 4421;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const put = (buf, i, v) => {
  if (i >= 0 && i < N) buf[i] += v;
};
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;

// B minor: Bm - G - D - A, voiced around B3-F#4
const CHORDS = [
  [47, 54, 59, 62], // Bm
  [43, 50, 55, 59], // G
  [45, 50, 54, 57], // D
  [45, 49, 52, 57], // A
];
const ROOTS = [35, 31, 38, 33];
// Lead hook (8ths, null = rest), one row per chord. Rising, hopeful.
const LEAD = [
  [74, null, 74, 76, 78, null, 76, 74],
  [71, null, 74, null, 78, 79, 78, 74],
  [73, null, 74, 73, 69, null, 73, 74],
  [76, null, 73, 71, 73, null, 69, 71],
];
// Ostinato pattern for the strings (indexes into the chord, 8 x 16ths)
const OST = [0, 2, 1, 2, 3, 2, 1, 2];

// ---------------- drums ----------------

function kick(t0, g = 1, long = false) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((long ? 0.7 : 0.4) * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (44 + 150 * Math.exp(-t * 38))) / SR;
    const body = Math.tanh(Math.sin(ph) * 2.8) * Math.exp(-t * (long ? 4 : 7));
    const click = i < 70 ? (rand() * 2 - 1) * (1 - i / 70) * 0.4 : 0;
    const v = (body + click) * 0.62 * g;
    put(dL, s + i, v);
    put(dR, s + i, v);
  }
  const dl = Math.floor(0.22 * SR);
  for (let i = 0; i < dl; i++) {
    const k = s + i;
    if (k < N) duck[k] = Math.min(duck[k], 0.3 + 0.7 * (i / dl) ** 0.7);
  }
}

/** Big cinematic snare: noise burst + 200 Hz body + a long room tail. */
function snare(t0, g = 1, pitch = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.45 * SR);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    lp += 0.4 * (n - lp);
    ph += (2 * Math.PI * 195 * pitch) / SR;
    const v = ((n - lp) * 0.4 * Math.exp(-t * 18) + (n - lp) * 0.12 * Math.exp(-t * 5) + Math.sin(ph) * 0.45 * Math.exp(-t * 30)) * g;
    put(dL, s + i, v);
    put(dR, s + i, v * 0.95);
    put(sL, s + i, v * 0.25);
    put(sR, s + i, v * 0.25);
  }
}

function clap(t0, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.3 * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = t < 0.025 ? Math.exp(-((t % 0.008) * 350)) : Math.exp(-(t - 0.025) * 14);
    const n = rand() * 2 - 1;
    lp += 0.45 * (n - lp);
    const v = (n - lp) * env * 0.35 * g;
    put(dL, s + i, v);
    put(dR, s + i, v * 0.9);
  }
}

function hat(t0, open = false, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((open ? 0.18 : 0.04) * SR);
  let prev = 0;
  const pan = open ? 0.6 : 0.45 + rand() * 0.2;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    const hp = n - prev;
    prev = n;
    const v = hp * Math.exp(-t * (open ? 18 : 90)) * 0.08 * g;
    put(dL, s + i, v * (1 - pan) * 2);
    put(dR, s + i, v * pan * 2);
  }
}

function crash(t0, g = 1, len = 2.6) {
  const s = Math.floor(t0 * SR);
  const n = Math.floor(len * SR);
  let pl = 0;
  let pr = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const a = rand() * 2 - 1;
    const b = rand() * 2 - 1;
    const env = Math.exp(-t * 1.9) * 0.12 * g;
    put(dL, s + i, (a - pl) * env);
    put(dR, s + i, (b - pr) * env);
    pl = a;
    pr = b;
  }
}

/** Sub boom + crash: a cinematic hit. */
function impact(t0, g = 1) {
  kick(t0, 1.3 * g, true);
  crash(t0, 1.2 * g);
  const s = Math.floor(t0 * SR);
  const len = Math.floor(2 * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (28 + 50 * Math.exp(-t * 3))) / SR;
    const v = Math.sin(ph) * Math.exp(-t * 1.8) * 0.5 * g;
    put(dL, s + i, v);
    put(dR, s + i, v);
  }
}

/** Reverse-ish cymbal swell into `t0`. */
function swell(t0, dur, g = 1) {
  const s = Math.floor((t0 - dur) * SR);
  const len = Math.floor(dur * SR);
  let pl = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const a = rand() * 2 - 1;
    const v = (a - pl) * p * p * 0.1 * g;
    pl = a;
    put(dL, s + i, v);
    put(dR, s + i, v);
  }
}

function snareRoll(bar, g = 1) {
  const hits = [];
  for (let k = 0; k < 4; k++) hits.push(k * 0.5);
  for (let k = 0; k < 4; k++) hits.push(2 + k * 0.25);
  for (let k = 0; k < 8; k++) hits.push(3 + k * 0.125);
  hits.forEach((b, i) => {
    const p = i / hits.length;
    snare(at(bar, b), (0.2 + 0.8 * p) * g, 1 + p * 0.5);
  });
}

function riser(t0, dur, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const n = rand() * 2 - 1;
    lp += lpA(250 + 9000 * p * p) * (n - lp);
    ph += (2 * Math.PI * (160 + 1000 * p * p)) / SR;
    const v = (lp * 0.22 + Math.sin(ph) * 0.05) * p * p * g;
    put(dL, s + i, v * (0.5 + 0.5 * Math.sin(p * 20)));
    put(dR, s + i, v * (0.5 - 0.5 * Math.sin(p * 20)));
  }
}

function keyClick(t0, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor(0.016 * SR);
  let prev = 0;
  const pan = 0.3 + rand() * 0.4;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const n = rand() * 2 - 1;
    const v = ((n - prev) * 0.5 + Math.sin(2 * Math.PI * 2600 * t) * 0.3) * Math.exp(-t * 280) * 0.18 * g;
    prev = n;
    put(dL, s + i, v * (1 - pan) * 2);
    put(dR, s + i, v * pan * 2);
  }
}

// ---------------- instruments ----------------

/** Warm piano: decaying harmonics, slight stretch, hammer noise. */
function piano(t0, midi, dur, g = 1, bright = 0.6) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.6) * SR);
  const f = mtof(midi);
  const H = 7;
  const ph = new Float64Array(H);
  const pan = 0.5 + (midi - 60) / 70;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let v = 0;
    for (let h = 1; h <= H; h++) {
      ph[h - 1] += (2 * Math.PI * f * h * (1 + 0.0004 * h * h)) / SR;
      v += (Math.sin(ph[h - 1]) / h ** (1.7 - 0.5 * bright)) * Math.exp(-t * (1.2 + h * 0.9));
    }
    if (i < 200) v += (rand() * 2 - 1) * (1 - i / 200) * 0.2 * bright;
    const rel = t > dur ? Math.exp(-(t - dur) * 9) : 1;
    const env = Math.min(1, i / 30) * Math.exp(-t * (0.9 + midi / 80)) * rel * 0.12 * g;
    put(mL, s + i, v * env * (1.2 - pan));
    put(mR, s + i, v * env * (0.8 + pan));
    put(sL, s + i, v * env * 0.5);
    put(sR, s + i, v * env * 0.5);
  }
}
function pianoChord(t0, notes, dur, g = 1, bright = 0.6) {
  notes.forEach((m, k) => {
    piano(t0 + k * 0.012, m, dur, g * (k === notes.length - 1 ? 1 : 0.85), bright);
  });
}

function saws(notes, detune) {
  const voices = [];
  for (const m of notes) {
    for (const d of detune) voices.push({ f: mtof(m + d), ph: rand(), pan: (d - detune[0]) / (detune[detune.length - 1] - detune[0] || 1) });
  }
  return voices;
}

/** Pad: wide detuned saws, slow attack, filtered. */
function pad(t0, dur, notes, g = 1, cutoff = 1200, attack = 0.4) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.3) * SR);
  const vs = saws(notes, [-0.16, -0.06, 0.06, 0.16]);
  let lL = 0;
  let lR = 0;
  const c = lpA(cutoff);
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
    lL += c * (a - lL);
    lR += c * (b - lR);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.3) : 1;
    const env = Math.min(1, t / attack) * rel * 0.014 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
    put(sL, s + i, lL * env * 0.4);
    put(sR, s + i, lR * env * 0.4);
  }
}

/** Strings: detuned saws with vibrato, a bowed attack and a brighter filter. */
function strings(t0, dur, notes, g = 1, cutoff = 2400, attack = 0.08) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.15) * SR);
  const vs = saws(notes, [-0.12, 0, 0.12]);
  let lL = 0;
  let lR = 0;
  const c = lpA(cutoff);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const vib = 1 + (t > 0.15 ? Math.sin(t * 2 * Math.PI * 5.2) * 0.0035 : 0);
    let a = 0;
    let b = 0;
    for (const v of vs) {
      v.ph = (v.ph + (v.f * vib) / SR) % 1;
      const x = v.ph * 2 - 1;
      a += x * (1 - v.pan);
      b += x * v.pan;
    }
    lL += c * (a - lL);
    lR += c * (b - lR);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.15) : 1;
    const env = Math.min(1, t / attack) * rel * 0.02 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
    put(sL, s + i, lL * env * 0.5);
    put(sR, s + i, lR * env * 0.5);
  }
}

/** Short staccato string note (spiccato) for the ostinato. */
function spiccato(t0, midi, g = 1, cutoff = 2600) {
  strings(t0, S16 * 0.7, [midi], g * 0.9, cutoff, 0.012);
}

/** Brass-like stack for the drop: saws + square an octave down, punchy. */
function brass(t0, dur, notes, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.1) * SR);
  const vs = saws(notes, [-0.1, 0.1]);
  const subs = notes.map((m) => ({ f: mtof(m - 12), ph: 0 }));
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
    for (const q of subs) {
      q.ph = (q.ph + q.f / SR) % 1;
      const x = q.ph < 0.5 ? 0.5 : -0.5;
      a += x;
      b += x;
    }
    const c = lpA(900 + 2600 * Math.exp(-t * 6) + 600);
    lL += c * (a - lL);
    lR += c * (b - lR);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.1) : 1;
    const env = Math.min(1, t / 0.02) * (0.7 + 0.3 * Math.exp(-t * 4)) * rel * 0.02 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
    put(sL, s + i, lL * env * 0.3);
    put(sR, s + i, lR * env * 0.3);
  }
}

function bassNote(t0, dur, midi, g = 1, cutBase = 220, cutEnv = 1400) {
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
    p2 = (p2 + (f * 1.005) / SR) % 1;
    const osc = (p1 * 2 - 1) * 0.6 + (p2 < 0.5 ? 0.4 : -0.4);
    const a = lpA(cutBase + cutEnv * Math.exp(-t * 14));
    a1 += a * (osc - a1);
    a2 += a * (a1 - a2);
    const env = Math.min(1, i / 80) * Math.min(1, (len - i) / 200);
    const sub = Math.sin(2 * Math.PI * (f / 2) * t) * 0.7;
    const v = (a2 + sub) * env * 0.34 * g;
    put(mL, s + i, v);
    put(mR, s + i, v);
  }
}

function lead(t0, dur, midi, g = 1) {
  const s = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.1) * SR);
  const vs = saws([midi], [-0.08, 0, 0.08]);
  const sub = { f: mtof(midi - 12), ph: 0 };
  let lL = 0;
  let lR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const vib = 1 + (t > 0.1 ? Math.sin(t * 2 * Math.PI * 5.5) * 0.004 : 0);
    let a = 0;
    let b = 0;
    for (const v of vs) {
      v.ph = (v.ph + (v.f * vib) / SR) % 1;
      const x = v.ph * 2 - 1;
      a += x * (1 - v.pan);
      b += x * v.pan;
    }
    sub.ph = (sub.ph + sub.f / SR) % 1;
    const sq = sub.ph < 0.5 ? 0.4 : -0.4;
    const c = lpA(2400 + 3000 * Math.exp(-t * 7));
    lL += c * (a + sq - lL);
    lR += c * (b + sq - lR);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.1) : 1;
    const env = Math.min(1, i / 150) * (0.75 + 0.25 * Math.exp(-t * 6)) * rel * 0.045 * g;
    put(mL, s + i, lL * env);
    put(mR, s + i, lR * env);
    put(sL, s + i, lL * env * 0.6);
    put(sR, s + i, lR * env * 0.6);
  }
}

/** Soft bell (two partials, long decay). */
function bell(t0, midi, g = 1) {
  const f = mtof(midi);
  const s = Math.floor(t0 * SR);
  const len = Math.floor(1.6 * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const v = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 4) + 0.2 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 8)) * Math.exp(-t * 2.6) * 0.1 * g;
    put(mL, s + i, v);
    put(mR, s + i, v);
    put(sL, s + i, v * 0.7);
    put(sR, s + i, v * 0.7);
  }
}
function chime(t0, g = 1) {
  bell(t0, 86, g);
  bell(t0 + 0.1, 93, g * 0.8);
}

/** Low heartbeat: two soft thumps per beat. */
function heartbeat(t0, g = 1) {
  kick(t0, 0.45 * g);
  kick(t0 + 0.2, 0.3 * g);
}

// ---------------- arrangement ----------------

const section = (b) =>
  b < 4 ? "hook" : b < 8 ? "spark" : b < 12 ? "scale" : b < 16 ? "platform" : b < 21 ? "human" : b < 26 ? "drop" : b === 26 ? "close" : b < 29 ? "sudo" : "outro";

for (let b = 0; b < BARS; b++) {
  const t = at(b);
  const ci = b % 4;
  const chord = CHORDS[ci];
  const root = ROOTS[ci];
  const up = chord.map((m) => m + 12);
  const sec = section(b);

  // ---- hook (0-3): pad under everything, solo piano
  if (sec === "hook") {
    pad(t, BAR, chord, 0.9, 900 + b * 150, b === 0 ? 1.2 : 0.3);
    if (b === 0) {
      // typing clicks on `whoami`, then the first chord on the name (beat 2)
      for (let k = 0; k < 7; k++) keyClick(t + 0.2 + k * 0.095, 0.8);
      pianoChord(at(0, 2), up, BAR, 1.1, 0.5);
      bassNote(at(0, 2), BAR * 1.5, root + 12, 0.5, 160, 200);
    } else {
      // one chord per role: bar 1, 1.5, 2; then the promise line on 2.5
      pianoChord(t, up, BEAT * 2, 1, 0.55);
      if (b === 1) pianoChord(at(1, 2), CHORDS[2].map((m) => m + 12), BEAT * 2, 0.95, 0.55);
      if (b === 2) {
        pianoChord(at(2, 2), CHORDS[3].map((m) => m + 12), BEAT * 2, 0.95, 0.55);
        strings(at(2, 2), BAR * 1.5, chord, 0.5, 1800, 0.6);
      }
      bassNote(t, BAR, root + 12, 0.5, 160, 200);
    }
    if (b === 3) {
      strings(t, BAR, CHORDS[3], 0.8, 2200, 0.3);
      riser(t, BAR, 1);
      snareRoll(3, 0.7);
      swell(at(4), BAR, 1);
    }
    continue;
  }

  // ---- the spark (4-7): arpeggio, strings in, soft kicks
  if (sec === "spark") {
    if (b === 4) crash(t, 0.9);
    pad(t, BAR, chord, 0.8, 1300, 0.2);
    strings(t, BAR, chord, 0.7 + (b - 4) * 0.1, 2000 + (b - 4) * 200, 0.2);
    for (let s = 0; s < 8; s++) piano(t + s * BEAT * 0.5, up[[0, 2, 1, 3, 2, 3, 1, 2][s]], BEAT * 0.5, 0.75, 0.5);
    bassNote(t, BAR * 0.95, root, 0.7, 180, 400);
    kick(t, 0.7);
    kick(t + 2 * BEAT, 0.6);
    if (b >= 5) snare(t + 3 * BEAT, 0.35, 0.9);
    // the alert, 7.5 beats into the scene; the award on bar 2.6
    if (b === 5) {
      snare(at(5, 3.5), 0.8, 0.8);
      crash(at(5, 3.5), 0.5, 1.5);
    }
    if (b === 6) {
      bell(at(6, 2.4), 83, 1);
      bell(at(6, 2.55), 90, 0.7);
    }
    if (b === 7) {
      snareRoll(7, 0.6);
      swell(at(8), BAR * 0.8, 0.8);
    }
    continue;
  }

  // ---- scale (8-11): ostinato 8ths, four on the floor, claps
  if (sec === "scale") {
    if (b === 8) crash(t, 1);
    pad(t, BAR, chord, 0.7, 1500, 0.1);
    strings(t, BAR, chord, 0.9, 2400, 0.15);
    for (let s = 0; s < 8; s++) spiccato(t + s * BEAT * 0.5, up[OST[s]], 0.9, 2600);
    for (let s = 0; s < 4; s++) piano(t + s * BEAT, up[[0, 2, 3, 1][s]] + 12, BEAT, 0.5, 0.5);
    for (let k = 0; k < 4; k++) {
      kick(t + k * BEAT, 0.85);
      bassNote(t + k * BEAT, BEAT * 0.9, root, 0.8, 200, 800);
      hat(t + k * BEAT + BEAT / 2, false, 0.7);
    }
    clap(t + BEAT, 0.7);
    clap(t + 3 * BEAT, 0.7);
    if (b === 9) {
      crash(at(9, 2), 0.6, 1.5); // the figures land
    }
    if (b === 11) {
      snareRoll(11, 0.7);
      swell(at(12), BAR * 0.8, 0.9);
    }
    continue;
  }

  // ---- the platform (12-15): 16th ostinato, hats, lead counter-melody
  if (sec === "platform") {
    if (b === 12) crash(t, 1);
    pad(t, BAR, chord, 0.7, 1700, 0.1);
    strings(t, BAR, [...chord, up[0]], 1, 2600, 0.15);
    for (let s = 0; s < 16; s++) spiccato(t + s * S16, up[OST[s % 8]], 0.75 + (s % 4 === 0 ? 0.25 : 0), 3000);
    for (let k = 0; k < 4; k++) {
      kick(t + k * BEAT, 0.95);
      bassNote(t + k * BEAT, BEAT * 0.45, root, 0.9, 220, 1000);
      bassNote(t + k * BEAT + BEAT / 2, BEAT * 0.4, root, 0.6, 220, 1000);
      for (let s = 0; s < 4; s++) hat(t + k * BEAT + s * S16, s === 2, s === 0 ? 0.7 : 0.45);
    }
    clap(t + BEAT, 0.8);
    clap(t + 3 * BEAT, 0.8);
    LEAD[ci].forEach((m, k) => {
      if (m !== null) piano(t + k * BEAT * 0.5, m, BEAT * 0.45, 0.7, 0.7);
    });
    if (b === 13) crash(at(13, 2), 0.6, 1.5); // ~1M lands
    if (b === 14) chime(at(14, 2), 0.9); // promotion
    if (b === 15) {
      snareRoll(15, 0.5);
      // the music opens up into the breakdown: no riser, a swell down
      strings(at(15, 2), BAR / 2, chord, 0.6, 1800, 0.2);
    }
    continue;
  }

  // ---- who I am (16-20): breakdown, solo piano + warm pad
  if (sec === "human") {
    if (b === 16) crash(t, 0.5, 3);
    pad(t, BAR, chord, 1.4, 1100, b === 16 ? 0.8 : 0.3);
    // held piano chord, a gentle quarter-note melody from bar 17.5 (the skills)
    pianoChord(t, up, BAR * 0.95, 0.95, 0.4);
    bassNote(t, BAR, root + 12, 0.5, 150, 200);
    if (b >= 17 && b < 19) {
      LEAD[ci].forEach((m, k) => {
        if (m !== null && k % 2 === 0) piano(t + k * BEAT * 0.5, m, BEAT * 0.9, 0.7, 0.45);
      });
    }
    if (b === 17) strings(at(17, 2), BAR * 2.5, chord, 0.45, 1600, 1.5);
    if (b === 19) {
      // three words: three piano hits on bar 19.5 + beats
      for (let k = 0; k < 3; k++) {
        pianoChord(at(19, 2 + k), CHORDS[(2 + k) % 4].map((m) => m + 12), BEAT, 1.2, 0.7);
        kick(at(19, 2 + k), 0.6, true);
      }
      strings(at(19, 2), BAR * 1.5, [...CHORDS[0], 71], 0.9, 2400, 0.6);
    }
    if (b === 20) {
      // the build into the drop
      strings(t, BAR, [...chord, up[0]], 1.1, 3000, 0.1);
      for (let s = 0; s < 16; s++) spiccato(t + s * S16, up[OST[s % 8]], 0.6 + s * 0.04, 2200 + s * 120);
      for (let k = 0; k < 4; k++) kick(t + k * BEAT, 0.7 + k * 0.1);
      snareRoll(20, 1.1);
      riser(t, BAR, 1.2);
      swell(at(21), BAR, 1.1);
    }
    continue;
  }

  // ---- what's next (21-25): the drop
  if (sec === "drop") {
    impact(t, b === 21 ? 1 : 0.6);
    pad(t, BAR, chord, 0.8, 2000, 0.05);
    strings(t, BAR, [...up, up[0] + 12], 1.1, 3200, 0.1);
    brass(t, BEAT * 1.5, chord, 1);
    brass(t + 2 * BEAT, BEAT * 0.75, chord, 0.8);
    brass(t + 3 * BEAT, BEAT * 0.75, chord, 0.9);
    for (let s = 0; s < 16; s++) spiccato(t + s * S16, up[OST[s % 8]], 0.8 + (s % 4 === 0 ? 0.3 : 0), 3400);
    for (let k = 0; k < 4; k++) {
      kick(t + k * BEAT, 1);
      bassNote(t + k * BEAT, BEAT * 0.45, root, 1, 240, 1200);
      bassNote(t + k * BEAT + BEAT / 2, BEAT * 0.4, root, 0.65, 240, 1200);
      for (let s = 0; s < 4; s++) hat(t + k * BEAT + s * S16, s === 2, s === 0 ? 0.8 : 0.5);
    }
    snare(t + BEAT, 0.9);
    snare(t + 3 * BEAT, 1);
    clap(t + BEAT, 0.6);
    clap(t + 3 * BEAT, 0.6);
    LEAD[ci].forEach((m, k) => {
      if (m !== null) lead(t + k * BEAT * 0.5, BEAT * 0.45, m, 1.1);
    });
    if (b === 25) snareRoll(25, 0.8);
    continue;
  }

  // ---- closing line (26): half time, sustained
  if (sec === "close") {
    impact(t, 1);
    pad(t, BAR, chord, 1.2, 2200, 0.05);
    strings(t, BAR, [...up, up[0] + 12], 1.2, 3000, 0.1);
    brass(t, BAR * 0.9, chord, 1);
    pianoChord(t, up, BAR, 1, 0.6);
    bassNote(t, BAR * 0.95, root, 1, 220, 800);
    kick(t + 2 * BEAT, 0.8);
    snare(t + 2 * BEAT, 0.9);
    for (let k = 0; k < 4; k++) hat(t + k * BEAT + BEAT / 2, true, 0.5);
    continue;
  }

  // ---- sudo (27-28): heartbeat, filtered pad
  if (sec === "sudo") {
    pad(t, BAR, chord, 1, 700 + (b - 27) * 300, b === 27 ? 0.5 : 0.1);
    bassNote(t, BAR, root + 12, 0.45, 140, 100);
    for (let k = 0; k < 4; k++) heartbeat(t + k * BEAT, 1);
    for (let s = 0; s < 8; s++) hat(t + s * BEAT * 0.5, false, 0.35);
    if (b === 27) for (const fr of [8, 14, 20, 26, 32, 38, 44, 50]) keyClick(t + fr / 30, 0.9);
    if (b === 28) {
      // "access granted": chime on beat 2, strings bloom
      chime(at(28, 2), 1.2);
      strings(at(28, 2), BAR * 0.6, CHORDS[2].map((m) => m + 12), 0.8, 2600, 0.1);
      riser(at(28, 2), BEAT * 2, 0.6);
      swell(at(29), BEAT * 2, 0.8);
    }
    continue;
  }

  // ---- outro (29-31): resolve
  if (b === 29) {
    impact(t, 1);
    strings(t, BAR * 3, [...CHORDS[2], 62 + 12, 66 + 12], 1.1, 2600, 0.1);
    pad(t, BAR * 3, CHORDS[2], 1.2, 1800, 0.1);
    pianoChord(t, CHORDS[2].map((m) => m + 12), BAR * 1.5, 1.2, 0.6);
    bassNote(t, BAR * 2.5, ROOTS[2], 0.9, 200, 500);
    kick(t + 2 * BEAT, 0.6, true);
  }
  if (b === 30) {
    pianoChord(t, CHORDS[3].map((m) => m + 12), BAR, 0.9, 0.5);
    pianoChord(at(30, 2), [...CHORDS[0].map((m) => m + 12), 71 + 12], BAR * 1.5, 1, 0.5);
    strings(at(30, 2), BAR * 1.5, [...CHORDS[0], 59 + 12], 0.9, 2200, 0.4);
    bassNote(at(30, 2), BAR * 1.5, ROOTS[0], 0.8, 180, 300);
  }
  if (b === 31) {
    pad(t, BAR, CHORDS[0], 1, 1200, 0.1);
    for (let k = 0; k < 4; k++) piano(t + k * BEAT, [71, 74, 78, 83][k] + 12, BEAT * 2, 0.7 - k * 0.1, 0.4);
  }
}

// ---------------- mix ----------------
// Send bus: a dotted-8th stereo delay plus a short diffuse tail, for space.
const delay = Math.floor(BEAT * 0.75 * SR);
for (let i = delay; i < N; i++) {
  sL[i] += sR[i - delay] * 0.35;
  sR[i] += sL[i - delay] * 0.35;
}
const taps = [0.031, 0.047, 0.071, 0.093, 0.127, 0.149].map((d) => Math.floor(d * SR));
const rvL = new Float32Array(N);
const rvR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  let a = 0;
  let b = 0;
  for (let k = 0; k < taps.length; k++) {
    const j = i - taps[k];
    if (j >= 0) {
      const g = 0.5 / (k + 1);
      a += (k % 2 ? sR[j] : sL[j]) * g;
      b += (k % 2 ? sL[j] : sR[j]) * g;
    }
  }
  rvL[i] = a;
  rvR[i] = b;
}
let peak = 0;
const L = new Float32Array(N);
const R = new Float32Array(N);
const fadeStart = N - Math.floor(SR * 2);
for (let i = 0; i < N; i++) {
  const wetL = (i >= delay ? sR[i - delay] * 0.3 : 0) + rvL[i] * 0.5;
  const wetR = (i >= delay ? sL[i - delay] * 0.3 : 0) + rvR[i] * 0.5;
  const f = i > fadeStart ? 1 - (i - fadeStart) / (N - fadeStart) : 1;
  L[i] = Math.tanh((dL[i] + (mL[i] + wetL) * duck[i]) * 1.25) * f;
  R[i] = Math.tanh((dR[i] + (mR[i] + wetR) * duck[i]) * 1.25) * f;
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

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack-v4.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${out} (${(N / SR).toFixed(1)}s)`);
