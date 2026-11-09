/**
 * Video v3: v2's tech part, plus a "who I am" chapter on a mountain-bike
 * trail. Same 128 BPM grid as v2 (one bar = 56.25 frames), so the reused v2
 * scenes stay on the beat.
 */
import type { IdeTimeline } from "../v2/Ide";
import { bar } from "../v2/theme";

/** Scene boundaries, in bars of the soundtrack (scripts/make-music-v3.mjs). */
const BARS = {
  editor: [0, 4],
  gitlog: [4, 10],
  pipeline: [10, 18],
  dashboard: [18, 22],
  exit: [22, 23],
  trail: [23, 36],
  sudo: [36, 38],
  outro: [38, 42],
} as const;

export type SceneKey3 = keyof typeof BARS;

export function span3(key: SceneKey3) {
  const [a, b] = BARS[key];
  return { from: bar(a), duration: bar(b) - bar(a) };
}

export const TOTAL_FRAMES = bar(42);

/** The IDE leaves for the trail chapter, comes back for `sudo`, then leaves for the outro. */
export const TIMELINE3: IdeTimeline = {
  order: Object.keys(BARS),
  span: (k) => span3(k as SceneKey3),
  offscreen: ["trail", "outro"],
};
