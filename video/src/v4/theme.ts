/**
 * Video v4: a story in chapters (spark, scale, platform, who I am, what's
 * next) on an original cinematic score at 100 BPM, so one bar = 72 frames and
 * one beat = 18 frames. Every cut lands on a bar of scripts/make-music-v4.mjs.
 */
import { interpolateColors } from "remotion";

export const FPS = 30;
export const BPM = 100;
const BAR_FRAMES = (60 / BPM) * 4 * FPS; // 72
export const bar = (n: number) => Math.round(n * BAR_FRAMES);
export const beat = (n: number) => Math.round((n * BAR_FRAMES) / 4);

/** Scene boundaries, in bars of the soundtrack. */
const BARS = {
  hook: [0, 4],
  spark: [4, 8],
  scale: [8, 12],
  platform: [12, 16],
  human: [16, 21],
  next: [21, 27],
  sudo: [27, 29],
  outro: [29, 32],
} as const;

export type SceneKey4 = keyof typeof BARS;
export const SCENE_KEYS4 = Object.keys(BARS) as SceneKey4[];

export function span4(key: SceneKey4) {
  const [a, b] = BARS[key];
  return { from: bar(a), duration: bar(b) - bar(a) };
}

export const TOTAL_FRAMES = bar(32); // 76.8 s

export function sceneAt(frame: number): SceneKey4 {
  let cur: SceneKey4 = "hook";
  for (const k of SCENE_KEYS4) if (frame >= span4(k).from) cur = k;
  return cur;
}

/** Palette: the website's dark theme plus one accent per chapter. */
export const P = {
  bg: "#06070c",
  bg2: "#0b0d16",
  fg: "#f4f5f8",
  muted: "#8b90a3",
  faint: "#4b5268",
  line: "rgba(255,255,255,0.09)",
  panel: "rgba(255,255,255,0.045)",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  violet: "#a855f7",
  amber: "#fb923c",
  gold: "#fbbf24",
  green: "#4ade80",
  red: "#f87171",
  pink: "#f472b6",
};

export const GRAD = `linear-gradient(90deg, ${P.cyan}, ${P.blue} 45%, ${P.violet})`;
export const WARM_GRAD = `linear-gradient(90deg, ${P.gold}, ${P.amber} 50%, ${P.pink})`;

export const ACCENT: Record<SceneKey4, string> = {
  hook: P.blue,
  spark: P.violet,
  scale: P.cyan,
  platform: P.blue,
  human: P.amber,
  next: P.violet,
  sudo: P.green,
  outro: P.blue,
};

/** Accent colour at a frame, cross-faded over the first 20 frames of each chapter. */
export function accentAt(frame: number): string {
  const key = sceneAt(frame);
  const i = SCENE_KEYS4.indexOf(key);
  const prev = SCENE_KEYS4[Math.max(0, i - 1)];
  const { from } = span4(key);
  return interpolateColors(frame, [from, from + 20], [ACCENT[prev], ACCENT[key]]);
}

/** Layout constants (px, in the 1920x1080 frame). */
export const L = {
  left: 140,
  top: 140,
  right: 1780,
};
