/** Video v2: "career deployed from an IDE". 128 BPM, so one bar = 56.25 frames. */
export const FPS = 30;
const BAR_FRAMES = ((60 / 128) * 4 * FPS) as number; // 56.25
export const bar = (n: number) => Math.round(n * BAR_FRAMES);
export const beat = (n: number) => Math.round((n * BAR_FRAMES) / 4);

/** Scene boundaries, in bars of the soundtrack (scripts/make-music-v2.mjs). */
const BARS = {
  editor: [0, 4],
  gitlog: [4, 10],
  pipeline: [10, 18],
  apply: [18, 20],
  cluster: [20, 25],
  dashboard: [25, 30],
  sudo: [30, 32],
  outro: [32, 36],
} as const;

export type SceneKey = keyof typeof BARS;
export const SCENE_KEYS = Object.keys(BARS) as SceneKey[];

export function span(key: SceneKey) {
  const [a, b] = BARS[key];
  return { from: bar(a), duration: bar(b) - bar(a) };
}

export const TOTAL_FRAMES = bar(36);

/** Editor palette (Material Ocean-like) plus the site's blue. */
export const K = {
  page: "#05060a",
  window: "#0f111a",
  chrome: "#0a0c13",
  panel: "#131622",
  border: "#1e2333",
  line: "#1a1e2c",
  fg: "#d6deeb",
  dim: "#7a8299",
  faint: "#4b5268",
  comment: "#6b7a90",
  keyword: "#c792ea",
  string: "#c3e88d",
  type: "#ffcb6b",
  func: "#82aaff",
  number: "#f78c6c",
  key: "#89ddff",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  violet: "#a855f7",
  green: "#4ade80",
  red: "#f87171",
  yellow: "#fbbf24",
};

/** Window geometry (px, in the 1920x1080 frame). */
export const W = {
  inset: 36,
  title: 40,
  tabs: 48,
  status: 34,
  activity: 58,
  sidebar: 270,
};
export const CONTENT = {
  width: 1920 - 2 * W.inset - W.activity - W.sidebar, // 1520
  height: 1080 - 2 * W.inset - W.title - W.tabs - W.status, // 886
};
