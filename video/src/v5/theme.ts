/**
 * Video v5: a trailer. One continuous camera, cuts on the beat at 128 BPM
 * (one bar = 56.25 frames, one beat = 14.06), full-bleed moving sets, kinetic
 * typography. 32 bars = 60 s. Every cut lands on a bar of
 * scripts/make-music-v5.mjs.
 */
import { interpolateColors } from "remotion";

export const FPS = 30;
export const BPM = 128;
const BAR_FRAMES = (60 / BPM) * 4 * FPS; // 56.25
export const bar = (n: number) => Math.round(n * BAR_FRAMES);
export const beat = (n: number) => Math.round((n * BAR_FRAMES) / 4);

/** Scene boundaries, in bars of the soundtrack. */
const BARS = {
  cold: [0, 2],
  roles: [2, 4],
  spark: [4, 8],
  scale: [8, 12],
  platform: [12, 16],
  human: [16, 21],
  next: [21, 26],
  sudo: [26, 28],
  outro: [28, 32],
} as const;

export type SceneKey5 = keyof typeof BARS;
export const SCENE_KEYS5 = Object.keys(BARS) as SceneKey5[];

export function span5(key: SceneKey5) {
  const [a, b] = BARS[key];
  return { from: bar(a), duration: bar(b) - bar(a) };
}

export const TOTAL_FRAMES = bar(32); // 60 s

export function sceneAt(frame: number): SceneKey5 {
  let cur: SceneKey5 = "cold";
  for (const k of SCENE_KEYS5) if (frame >= span5(k).from) cur = k;
  return cur;
}

/** Palette: the website's dark theme plus one accent per chapter. */
export const P = {
  bg: "#05060a",
  bg2: "#0c0e18",
  fg: "#f4f5f8",
  muted: "#8b90a3",
  faint: "#4b5268",
  line: "rgba(255,255,255,0.1)",
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
export const WARM = `linear-gradient(90deg, ${P.gold}, ${P.amber} 50%, ${P.pink})`;

export const ACCENT: Record<SceneKey5, string> = {
  cold: P.blue,
  roles: P.blue,
  spark: P.violet,
  scale: P.cyan,
  platform: P.blue,
  human: P.amber,
  next: P.violet,
  sudo: P.green,
  outro: P.blue,
};
export function accentAt(frame: number): string {
  const key = sceneAt(frame);
  const i = SCENE_KEYS5.indexOf(key);
  const prev = SCENE_KEYS5[Math.max(0, i - 1)];
  const { from } = span5(key);
  return interpolateColors(frame, [from, from + 12], [ACCENT[prev], ACCENT[key]]);
}

/** How hard the camera punches on the beat, per scene (0 = still). */
export const ENERGY: Record<SceneKey5, number> = {
  cold: 0,
  roles: 1,
  spark: 1,
  scale: 1,
  platform: 1.1,
  human: 0.45,
  next: 1.3,
  sudo: 0.3,
  outro: 0.7,
};

/** Camera shakes (absolute frames) and how hard. Mirrors the hits of the music. */
export const HITS: { at: number; amp: number }[] = [
  { at: bar(2), amp: 1.5 }, // the name
  { at: bar(3), amp: 0.5 },
  { at: bar(3) + beat(1), amp: 0.5 },
  { at: bar(3) + beat(2), amp: 0.6 },
  { at: bar(4), amp: 1.1 }, // drop: the spark
  { at: bar(6), amp: 0.9 }, // alert
  { at: bar(7), amp: 0.8 }, // award
  { at: bar(8), amp: 1 }, // scale
  { at: bar(9), amp: 0.9 }, // ~58M
  { at: bar(10), amp: 0.9 }, // ~9.3 PB
  { at: bar(12), amp: 1 }, // platform
  { at: bar(13), amp: 0.9 }, // ~1M
  { at: bar(14.5), amp: 0.8 }, // promotion
  { at: bar(16), amp: 0.3 },
  { at: bar(19.75), amp: 0.5 },
  { at: bar(20), amp: 0.5 },
  { at: bar(20.25), amp: 0.5 },
  { at: bar(21), amp: 1.5 }, // drop: what's next
  { at: bar(22), amp: 1 },
  { at: bar(23), amp: 1 },
  { at: bar(24), amp: 1 },
  { at: bar(25), amp: 1 },
  { at: bar(27.5), amp: 0.9 }, // access granted
  { at: bar(28), amp: 1.1 }, // outro
];

/** Whip pans at the cuts: direction of the pan. */
export const WHIPS: Partial<Record<SceneKey5, 1 | -1>> = { spark: 1, scale: -1, platform: 1, next: -1, outro: 1 };
