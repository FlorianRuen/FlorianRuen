import {
  ChevronDownIcon,
  FileCodeIcon,
  FilesIcon,
  GitBranchIcon,
  type LucideIcon,
  PlayIcon,
  SearchIcon,
  SettingsIcon,
  TerminalIcon,
} from "lucide-react";
import type React from "react";
import { createContext, useContext } from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { clamp } from "../components";
import { MONO, SANS } from "../theme";
import { bar, K, type SceneKey, span, W } from "./theme";

/** What the IDE chrome shows for each scene. */
const FILES: Record<string, { tab: string; path: string; lang: string; color: string }> = {
  editor: { tab: "florian.go", path: "cmd/florian/florian.go", lang: "Go", color: K.cyan },
  gitlog: { tab: "git log", path: "~/florian-ruen", lang: "Git", color: K.number },
  pipeline: { tab: "pipeline #2026", path: ".ci/pipeline.yml", lang: "CI", color: K.green },
  apply: { tab: "florian.yaml", path: "deploy/florian.yaml", lang: "YAML", color: K.violet },
  cluster: { tab: "cluster: prod", path: "k8s://prod/florian", lang: "K8s", color: K.blue },
  dashboard: { tab: "dashboard", path: "grafana://florian/overview", lang: "Grafana", color: K.yellow },
  sudo: { tab: "zsh", path: "~", lang: "zsh", color: K.fg },
  exit: { tab: "zsh", path: "~", lang: "zsh", color: K.fg },
  outro: { tab: "README.md", path: "README.md", lang: "Markdown", color: K.fg },
};

const TREE: { name: string; scene?: SceneKey; depth: number; dir?: boolean }[] = [
  { name: "florian-ruen", depth: 0, dir: true },
  { name: ".ci", depth: 1, dir: true },
  { name: "pipeline.yml", depth: 2, scene: "pipeline" },
  { name: "cmd/florian", depth: 1, dir: true },
  { name: "florian.go", depth: 2, scene: "editor" },
  { name: "deploy", depth: 1, dir: true },
  { name: "florian.yaml", depth: 2, scene: "apply" },
  { name: "cluster.k8s", depth: 2, scene: "cluster" },
  { name: "monitoring", depth: 1, dir: true },
  { name: "overview.json", depth: 2, scene: "dashboard" },
  { name: ".gitignore", depth: 1 },
  { name: "README.md", depth: 1, scene: "outro" },
];

/**
 * Which scenes play when, and during which ones the IDE is off screen (it
 * flies away when one starts and flies back when it ends). Defaults to v2.
 */
export type IdeTimeline = {
  order: string[];
  span: (key: string) => { from: number; duration: number };
  offscreen: string[];
};
const V2_TIMELINE: IdeTimeline = {
  order: ["editor", "gitlog", "pipeline", "apply", "cluster", "dashboard", "sudo", "outro"],
  span: (k) => span(k as SceneKey),
  offscreen: ["outro"],
};
export const IdeTimelineContext = createContext<IdeTimeline>(V2_TIMELINE);

function sceneAt(frame: number, tl: IdeTimeline): string {
  let cur = tl.order[0];
  for (const k of tl.order) if (frame >= tl.span(k).from) cur = k;
  return cur;
}

/**
 * The IDE window. Flies in with a 3D tilt during the first bar, then holds
 * still (with a tiny camera push on every scene change) until the outro.
 */
export const Ide: React.FC<{ children: React.ReactNode; status?: string }> = ({ children, status }) => {
  const frame = useCurrentFrame();
  const tl = useContext(IdeTimelineContext);
  const scene = sceneAt(frame, tl);
  const file = FILES[scene] ?? FILES.sudo;
  const start = tl.span(scene).from;

  // 3D fly-in over the first bar
  let fly = interpolate(frame, [0, bar(1)], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  // Off-screen scenes: the window tilts back and recedes, then flies back in after
  let away = 0;
  for (const k of tl.offscreen) {
    const { from, duration } = tl.span(k);
    const end = from + duration;
    if (frame >= from && frame < end) away = interpolate(frame, [from, from + 24], [0, 1], { ...clamp, easing: (t) => t * t });
    if (frame >= end) fly = Math.min(fly, interpolate(frame, [end, end + 18], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 }));
  }
  // Small punch on every cut
  const punch = interpolate(frame - start, [0, 10], [1, 0], clamp);

  const rx = (1 - fly) * 28 + away * 18;
  const ry = (1 - fly) * -22 + away * -8;
  const tz = (1 - fly) * -900 + away * -1400;
  const scale = 1 + punch * 0.012;

  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
      <div
        style={{
          position: "absolute",
          inset: W.inset,
          transform: `translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`,
          opacity: Math.min(1, fly * 1.5) * (1 - away),
          borderRadius: 16,
          overflow: "hidden",
          background: K.window,
          border: `1px solid ${K.border}`,
          boxShadow: `0 50px 140px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03), 0 0 120px ${K.blue}22`,
          display: "flex",
          flexDirection: "column",
          fontFamily: SANS,
          color: K.fg,
        }}
      >
        {/* title bar */}
        <div
          style={{
            height: W.title,
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            background: K.chrome,
            borderBottom: `1px solid ${K.border}`,
            gap: 9,
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
          ))}
          <div style={{ flex: 1, textAlign: "center", fontSize: 17, color: K.dim, fontFamily: MONO }}>
            florian-ruen — {file.path}
          </div>
          <PlayIcon size={16} color={K.green} fill={K.green} />
        </div>

        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* activity bar */}
          <div
            style={{
              width: W.activity,
              background: K.chrome,
              borderRight: `1px solid ${K.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 18,
              gap: 26,
            }}
          >
            {([FilesIcon, SearchIcon, GitBranchIcon, TerminalIcon] as LucideIcon[]).map((Icon, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <Icon key={i} size={26} color={i === 0 ? K.fg : K.faint} strokeWidth={1.6} />
            ))}
            <div style={{ flex: 1 }} />
            <SettingsIcon size={24} color={K.faint} style={{ marginBottom: 18 }} />
          </div>

          {/* explorer */}
          <div style={{ width: W.sidebar, background: K.panel, borderRight: `1px solid ${K.border}`, paddingTop: 14 }}>
            <div style={{ fontSize: 14, letterSpacing: 2, color: K.dim, padding: "0 20px 12px", fontWeight: 600 }}>
              EXPLORER
            </div>
            {TREE.map((n) => {
              const active = n.scene === scene;
              return (
                <div
                  key={n.name + n.depth}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 34,
                    paddingLeft: 14 + n.depth * 18,
                    fontFamily: MONO,
                    fontSize: 17,
                    color: active ? K.fg : n.dir ? K.dim : "#9aa3ba",
                    background: active ? "rgba(59,130,246,0.18)" : "transparent",
                    borderLeft: `3px solid ${active ? K.blue : "transparent"}`,
                  }}
                >
                  {n.dir ? <ChevronDownIcon size={15} /> : <FileCodeIcon size={15} color={active ? file.color : K.faint} />}
                  {n.name}
                </div>
              );
            })}
          </div>

          {/* editor area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ height: W.tabs, display: "flex", background: K.chrome, borderBottom: `1px solid ${K.border}` }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 26px",
                  background: K.window,
                  borderTop: `2px solid ${file.color}`,
                  borderRight: `1px solid ${K.border}`,
                  fontFamily: MONO,
                  fontSize: 18,
                }}
              >
                <FileCodeIcon size={17} color={file.color} />
                {file.tab}
                <span style={{ color: K.faint, marginLeft: 6 }}>×</span>
              </div>
            </div>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
          </div>
        </div>

        {/* status bar */}
        <div
          style={{
            height: W.status,
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "0 16px",
            background: "#1d4ed8",
            fontFamily: MONO,
            fontSize: 16,
            color: "#e8eeff",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <GitBranchIcon size={15} /> main
          </span>
          <span>{status ?? "✓ 0 problems"}</span>
          <div style={{ flex: 1 }} />
          <span>Ln {12 + Math.floor(random(`ln${scene}`) * 40)}, Col 1</span>
          <span>UTF-8</span>
          <span>{file.lang}</span>
          <span>🤖 Claude Code</span>
        </div>
      </div>
    </div>
  );
};
