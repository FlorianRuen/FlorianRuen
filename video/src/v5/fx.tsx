import type React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp } from "../components";
import { MONO, SANS } from "../theme";
import { beat, ENERGY, HITS, P, type SceneKey5, sceneAt, span5, WHIPS } from "./theme";

const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
/** 0 → 1 over `len` frames from `at`. */
export const rise = (frame: number, at: number, len = 10) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: easeOut });
/** 0 → 1 with overshoot. */
export const pop = (frame: number, at: number, len = 9) => (frame < at ? 0 : easeOutBack(Math.min(1, (frame - at) / len)));
/** 1 on a beat, decaying before the next one. */
export const kick = (frame: number) => Math.exp(-((frame % beat(1)) / beat(1)) * 7);

/** Sum of the camera shakes active at `frame` (absolute), as [dx, dy, rot]. */
export function shakeAt(frame: number): [number, number, number] {
  let dx = 0;
  let dy = 0;
  let rot = 0;
  for (const h of HITS) {
    const t = frame - h.at;
    if (t < 0 || t > 14) continue;
    const env = Math.exp(-t * 0.35) * h.amp;
    dx += (random(`sx${h.at}${t}`) - 0.5) * 36 * env;
    dy += (random(`sy${h.at}${t}`) - 0.5) * 26 * env;
    rot += (random(`sr${h.at}${t}`) - 0.5) * 1.2 * env;
  }
  return [dx, dy, rot];
}

/** Strength (0..1) of the chromatic aberration / flash at `frame`. */
export function hitAt(frame: number) {
  let v = 0;
  for (const h of HITS) {
    const t = frame - h.at;
    if (t >= 0 && t < 10) v = Math.max(v, Math.exp(-t * 0.45) * Math.min(1, h.amp));
  }
  return v;
}

/**
 * The camera: a slow continuous push, a punch on every kick (scaled by the
 * scene's energy), shakes on the hits, and a whip pan with motion blur on the
 * cuts that have one.
 */
export const Camera: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const scene = sceneAt(frame);
  const { from, duration } = span5(scene);
  const local = frame - from;
  const energy = ENERGY[scene];
  const punch = 1 + kick(frame) * 0.018 * energy;
  const push = 1 + ((local / duration) % 1) * 0.04;
  const [sx, sy, sr] = shakeAt(frame);

  // whip pan: the previous shot leaves fast, the new one arrives from the other side
  const dir = WHIPS[scene] ?? 0;
  let whipX = 0;
  let blur = 0;
  if (dir) {
    const p = interpolate(local, [0, 9], [1, 0], { ...clamp, easing: easeOut });
    whipX = dir * p * 900;
    blur = p * 40;
  }
  // and the shot before it leaves in the same direction
  const nextKey = nextScene(scene);
  if (nextKey && WHIPS[nextKey]) {
    const nextFrom = span5(nextKey).from;
    const p = interpolate(frame, [nextFrom - 6, nextFrom], [0, 1], { ...clamp, easing: (x) => x * x });
    whipX += -(WHIPS[nextKey] ?? 0) * p * 500;
    blur = Math.max(blur, p * 30);
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${whipX + sx}px, ${sy}px) rotate(${sr}deg) scale(${punch * push})`,
        filter: blur > 0.5 ? `blur(${blur * 0.15}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", inset: 0, filter: blur > 0.5 ? `url(#whip)` : undefined }}>{children}</div>
      <svg aria-hidden="true" width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whip" x="-20%" width="140%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
    </AbsoluteFill>
  );
};

function nextScene(key: SceneKey5): SceneKey5 | null {
  const order: SceneKey5[] = ["cold", "roles", "spark", "scale", "platform", "human", "next", "sudo", "outro"];
  const i = order.indexOf(key);
  return order[i + 1] ?? null;
}

/** Post: flash on hits, vignette, grain, letterbox. */
export const Post: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const hit = hitAt(frame);
  return (
    <AbsoluteFill style={{ background: P.bg, overflow: "hidden" }}>
      <AbsoluteFill>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: hit * 0.12, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6))", pointerEvents: "none" }} />
      <Grain frame={frame} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 54, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 54, background: "#000" }} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.05 }) => (
  <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={1} seed={Math.floor(frame / 2) % 60} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1920} height={1080} filter="url(#grain)" />
  </svg>
);

/**
 * Kinetic line: each word slams in from depth on its own frame (scale 2.2 →
 * 1 with a blur), then the whole line flies out at `until`.
 */
export const Slam: React.FC<{
  text: string;
  at: number;
  until?: number;
  size?: number;
  weight?: number;
  color?: string;
  gradient?: string;
  stagger?: number;
  align?: "left" | "center";
  style?: React.CSSProperties;
  outDir?: [number, number];
}> = ({ text, at, until, size = 120, weight = 900, color = P.fg, gradient, stagger = beat(0.5), align = "left", style, outDir = [0, -120] }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until === undefined ? 0 : interpolate(frame, [until - 5, until], [0, 1], { ...clamp, easing: (x) => x * x });
  if (out >= 1) return null;
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: -size * 0.045,
        lineHeight: 1,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `0 ${size * 0.24}px`,
        opacity: 1 - out,
        transform: `translate(${out * outDir[0]}px, ${out * outDir[1]}px) scale(${1 + out * 0.25})`,
        filter: out > 0 ? `blur(${out * 12}px)` : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const s = rise(frame, at + i * stagger, 7);
        const z = 1 + (1 - s) * 1.4;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: words are positional
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `scale(${z})`,
              filter: s < 1 ? `blur(${(1 - s) * 14}px)` : undefined,
              color: gradient ? "transparent" : color,
              backgroundImage: gradient,
              backgroundClip: gradient ? "text" : undefined,
              WebkitBackgroundClip: gradient ? "text" : undefined,
              transformOrigin: "center",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Mono tag in the corner: `01 // the spark`, slides in. */
export const Tag: React.FC<{ n: number; label: string; accent: string; at?: number }> = ({ n, label, accent, at = 2 }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, at, 8);
  return (
    <div style={{ position: "absolute", left: 120, top: 100, display: "flex", alignItems: "center", gap: 16, fontFamily: MONO, fontSize: 26, letterSpacing: 4, textTransform: "uppercase", opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
      <span style={{ color: accent, fontWeight: 700 }}>{String(n).padStart(2, "0")}</span>
      <span style={{ width: 40, height: 3, background: accent }} />
      <span style={{ color: P.fg }}>{label}</span>
    </div>
  );
};

/** Big number counting up with a slam, label under it. */
export const Big: React.FC<{ value: string; label: string; at: number; color: string; size?: number; until?: number; align?: "left" | "center"; style?: React.CSSProperties }> = ({ value, label, at, color, size = 300, until, align = "left", style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const m = value.match(/^([^\d]*)(\d+)(?:([.,])(\d+))?(.*)$/);
  const prefix = m?.[1] ?? "";
  const decimals = m?.[4]?.length ?? 0;
  const n = m ? Number(`${m[2]}.${m[4] ?? 0}`) : 0;
  const sep = m?.[3] ?? ".";
  const suffix = m?.[5] ?? value;
  const p = interpolate(frame, [at, at + beat(2)], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 5 });
  const s = pop(frame, at, 10);
  const out = until === undefined ? 0 : interpolate(frame, [until - 5, until], [0, 1], clamp);
  if (out >= 1) return null;
  return (
    <div style={{ textAlign: align, opacity: Math.min(1, s) * (1 - out), transform: `scale(${Math.max(0.01, s * (1 + out * 0.3))})`, transformOrigin: align === "center" ? "center" : "left center", ...style }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.05, color, textShadow: `0 0 ${size * 0.4}px ${color}66` }}>
        {prefix}
        {(n * p).toFixed(decimals).replace(".", sep)}
        {suffix}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 30, color: P.fg, marginTop: 18, letterSpacing: 3, textTransform: "uppercase", opacity: rise(frame, at + 6, 8) }}>{label}</div>
    </div>
  );
};

/** Mono chip. */
export const Chip: React.FC<{ at: number; color: string; children: React.ReactNode; big?: boolean }> = ({ at, color, children, big }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at, 8);
  if (frame < at) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: big ? 30 : 24, fontWeight: 600, padding: big ? "12px 22px" : "8px 18px", borderRadius: 8, color: P.fg, background: `${color}26`, border: `2px solid ${color}`, opacity: Math.min(1, s), transform: `scale(${s})`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

export const Caret: React.FC<{ frame: number; height?: number }> = ({ frame, height = 40 }) => (
  <span style={{ display: "inline-block", width: height * 0.5, height, marginLeft: 8, verticalAlign: "middle", background: P.fg, opacity: frame % 16 < 10 ? 1 : 0.1 }} />
);

/** Full-frame colour flash at `at`. */
export const Flash: React.FC<{ at: number; color?: string; strength?: number; len?: number }> = ({ at, color = "#fff", strength = 0.5, len = 8 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const o = interpolate(frame, [at, at + len], [strength, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

/** Scene wrapper: hard cut in, quick fade out on the last frames. */
export const Shot: React.FC<{ duration: number; children: React.ReactNode; fadeOut?: number }> = ({ duration, children, fadeOut = 0 }) => {
  const frame = useCurrentFrame();
  const o = fadeOut ? interpolate(frame, [duration - fadeOut, duration], [1, 0], clamp) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const alpha = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

export const months = (from: string, to: string) => {
  const [y1, m1 = 1] = from.split("-").map(Number);
  const [y2, m2 = 1] = to.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
};
