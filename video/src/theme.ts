import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

/** Same fonts as the website (Inter + JetBrains Mono). */
export const SANS = loadInter("normal", {
  weights: ["400", "500", "600", "800", "900"],
  subsets: ["latin"],
}).fontFamily;
export const MONO = loadMono("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

/** Website primary (hsl 221 83% 50%) plus an electric gradient for energy. */
export const C = {
  bg: "#07080d",
  bg2: "#0d1020",
  fg: "#f4f5f8",
  muted: "#8b90a3",
  primary: "#2563eb",
  blue: "#3b82f6",
  cyan: "#22d3ee",
  violet: "#a855f7",
  green: "#4ade80",
  gold: "#fbbf24",
  border: "rgba(255,255,255,0.10)",
};

export const GRADIENT = `linear-gradient(90deg, ${C.cyan}, ${C.blue} 45%, ${C.violet})`;

export const FPS = 30;
/** 120 BPM: one beat = 15 frames, one bar = 60 frames. */
export const BEAT = 15;
export const BAR = 60;

/** Scene timeline, in frames. Every cut lands on a bar of the soundtrack. */
export const SCENES = {
  boot: { from: 0, duration: 3 * BAR },
  hero: { from: 3 * BAR, duration: 4 * BAR },
  numbers: { from: 7 * BAR, duration: 4 * BAR },
  journey: { from: 11 * BAR, duration: 8 * BAR },
  human: { from: 19 * BAR, duration: 4 * BAR },
  stack: { from: 23 * BAR, duration: 4 * BAR },
  education: { from: 27 * BAR, duration: 3 * BAR },
  outro: { from: 30 * BAR, duration: 3 * BAR },
} as const;

export const TOTAL_FRAMES = 33 * BAR; // 66 s
