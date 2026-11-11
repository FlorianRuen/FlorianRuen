import type React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp } from "../components";
import { MONO, SANS } from "../theme";
import { bar, L, P, SCENE_KEYS4, type SceneKey4, span4 } from "./theme";

const ease = (x: number) => 1 - (1 - x) ** 3;

/** 0 → 1 over `len` frames from `at`, cubic ease-out. */
export const rise = (frame: number, at: number, len = 14) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: ease });

/**
 * Cinematic backdrop: deep gradient, two slow aurora blobs tinted with the
 * chapter accent, a diagonal light sweep, grain and a vignette. Uses the
 * absolute frame so nothing jumps between scenes.
 */
export const Backdrop: React.FC<{ frame: number; accent: string; energy?: number }> = ({ frame, accent, energy = 0.5 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${P.bg2}, ${P.bg} 70%)`, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        width: 1500,
        height: 1500,
        left: -500 + Math.sin(frame / 140) * 160,
        top: -800 + Math.cos(frame / 170) * 120,
        background: `radial-gradient(circle, ${accent}${alpha(0.22 + energy * 0.14)}, transparent 60%)`,
        filter: "blur(30px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 1300,
        height: 1300,
        right: -500 + Math.cos(frame / 150) * 140,
        bottom: -700 + Math.sin(frame / 120) * 100,
        background: `radial-gradient(circle, ${P.violet}${alpha(0.12 + energy * 0.1)}, transparent 60%)`,
        filter: "blur(30px)",
      }}
    />
    {/* light sweep */}
    <div
      style={{
        position: "absolute",
        inset: -400,
        background: `linear-gradient(115deg, transparent 40%, ${accent}${alpha(0.07)} 50%, transparent 60%)`,
        transform: `translateX(${((frame * 1.6) % 2600) - 1300}px)`,
      }}
    />
    {/* dust */}
    {Array.from({ length: 36 }).map((_, i) => {
      const x = random(`dx${i}`) * 1920;
      const speed = 0.2 + random(`ds${i}`) * 0.5;
      const y = (random(`dy${i}`) * 1200 - frame * speed) % 1200;
      const size = 1.5 + random(`dz${i}`) * 2.5;
      return (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          key={i}
          style={{
            position: "absolute",
            left: x + Math.sin(frame / 60 + i) * 12,
            top: y < 0 ? y + 1200 : y,
            width: size,
            height: size,
            borderRadius: size,
            background: i % 4 === 0 ? accent : P.fg,
            opacity: 0.12 + random(`do${i}`) * 0.3,
          }}
        />
      );
    })}
    <Grain frame={frame} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65))" }} />
  </AbsoluteFill>
);

/** Film grain, regenerated every other frame. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.07 }) => (
  <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "overlay" }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={Math.floor(frame / 2) % 200} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1920} height={1080} filter="url(#grain)" />
  </svg>
);

/** `01 // the spark · 2018`, typed in, top-left of a chapter. */
export const Chapter: React.FC<{ index: number; label: string; meta?: string; accent: string; at?: number }> = ({ index, label, meta, accent, at = 6 }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, at, 12);
  const shown = Math.floor(interpolate(frame, [at + 4, at + 20], [0, label.length], clamp));
  return (
    <div style={{ position: "absolute", left: L.left, top: 70, display: "flex", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: 24, letterSpacing: 3, opacity: s, transform: `translateX(${(1 - s) * -30}px)` }}>
      <span style={{ color: accent, fontWeight: 700 }}>{String(index).padStart(2, "0")}</span>
      <span style={{ width: 36, height: 2, background: accent, opacity: 0.8 }} />
      <span style={{ color: P.muted, textTransform: "uppercase" }}>
        {label.slice(0, shown)}
        <span style={{ opacity: frame % 16 < 8 && shown < label.length ? 1 : 0 }}>_</span>
      </span>
      {meta && (
        <span style={{ color: P.faint, opacity: rise(frame, at + 22, 10) }}>
          · {meta}
        </span>
      )}
    </div>
  );
};

const CHAPTERS: SceneKey4[] = ["spark", "scale", "platform", "human", "next"];

/** Bottom rail: the five chapters, the current one filling with the music. */
export const Rail: React.FC<{ frame: number; accent: string; labels: Partial<Record<SceneKey4, string>> }> = ({ frame, accent, labels }) => {
  const show = interpolate(frame, [bar(4), bar(4) + 20, bar(27) - 10, bar(27)], [0, 1, 1, 0], clamp);
  if (show <= 0) return null;
  return (
    <div style={{ position: "absolute", left: L.left, right: 1920 - L.right, bottom: 56, display: "flex", gap: 14, opacity: show }}>
      {CHAPTERS.map((k, i) => {
        const { from, duration } = span4(k);
        const p = interpolate(frame, [from, from + duration], [0, 1], clamp);
        const active = frame >= from && frame < from + duration;
        return (
          <div key={k} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 2, background: P.line, overflow: "hidden" }}>
              <div style={{ width: `${p * 100}%`, height: "100%", background: active ? accent : P.muted, opacity: active ? 1 : 0.6, boxShadow: active ? `0 0 12px ${accent}` : "none" }} />
            </div>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: active ? P.fg : p >= 1 ? P.muted : P.faint }}>
              {String(i + 1).padStart(2, "0")} {labels[k]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** A big line of text revealed word by word (rise + un-blur), from `at`. */
export const Words: React.FC<{
  text: string;
  at: number;
  size?: number;
  weight?: number;
  color?: string;
  gradient?: string;
  stagger?: number;
  style?: React.CSSProperties;
  until?: number;
}> = ({ text, at, size = 96, weight = 900, color = P.fg, gradient, stagger = 3, style, until }) => {
  const frame = useCurrentFrame();
  const out = until === undefined ? 1 : interpolate(frame, [until - 8, until], [1, 0], clamp);
  if (frame < at || out <= 0) return null;
  const words = text.split(" ");
  return (
    <div style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: size > 60 ? -size * 0.035 : -1, lineHeight: 1.08, display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.26}px`, opacity: out, ...style }}>
      {words.map((w, i) => {
        const s = rise(frame, at + i * stagger, 16);
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: words are positional
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${(1 - s) * 34}px)`,
              filter: `blur(${(1 - s) * 10}px)`,
              color: gradient ? "transparent" : color,
              backgroundImage: gradient,
              backgroundClip: gradient ? "text" : undefined,
              WebkitBackgroundClip: gradient ? "text" : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Small mono caption, fading in from `at` and out at `until`. */
export const Caption: React.FC<{ at: number; until?: number; color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, until, color = P.muted, size = 26, children, style }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, at, 14) * (until === undefined ? 1 : interpolate(frame, [until - 8, until], [1, 0], clamp));
  if (s <= 0) return null;
  return (
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, color, lineHeight: 1.4, opacity: s, transform: `translateY(${(1 - s) * 16}px)`, ...style }}>
      {children}
    </div>
  );
};

/** "~9,3 Po" → { prefix: "~", n: 9.3, decimals: 1, sep: ",", suffix: " Po" } */
export function parseValue(value: string) {
  const m = value.match(/^([^\d]*)(\d+)(?:([.,])(\d+))?(.*)$/);
  if (!m) return { prefix: "", n: 0, decimals: 0, sep: ".", suffix: value };
  const decimals = m[4]?.length ?? 0;
  return { prefix: m[1], n: Number(`${m[2]}.${m[4] ?? 0}`), decimals, sep: m[3] ?? ".", suffix: m[5] };
}

/** A resume figure counting up from `at`, with its label under it. */
export const Figure: React.FC<{ value: string; label: string; at: number; color: string; size?: number; len?: number; style?: React.CSSProperties }> = ({ value, label, at, color, size = 150, len = 36, style }) => {
  const frame = useCurrentFrame();
  const { prefix, n, decimals, sep, suffix } = parseValue(value);
  const p = interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 4 });
  const s = rise(frame, at, 12);
  const v = (n * p).toFixed(decimals).replace(".", sep);
  return (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 30}px)`, ...style }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.04, color, textShadow: `0 0 60px ${color}55` }}>
        {prefix}
        {v}
        {suffix}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: P.muted, marginTop: 14, letterSpacing: 1, maxWidth: 520, lineHeight: 1.4 }}>{label}</div>
    </div>
  );
};

/** Mono chip (tech, interest, tag). */
export const Chip: React.FC<{ at: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, color = P.blue, children, style }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, at, 12);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: MONO,
        fontSize: 21,
        padding: "8px 16px",
        borderRadius: 8,
        color: P.fg,
        background: `${color}1f`,
        border: `1px solid ${color}77`,
        opacity: s,
        transform: `translateY(${(1 - s) * 14}px) scale(${0.9 + s * 0.1})`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Blinking terminal caret. */
export const Caret: React.FC<{ frame: number; height?: number }> = ({ frame, height = 40 }) => (
  <span style={{ display: "inline-block", width: height * 0.5, height, marginLeft: 8, verticalAlign: "middle", background: P.fg, opacity: frame % 20 < 12 ? 1 : 0.1 }} />
);

/** White flash on a hit, decaying over `len` frames from `at`. */
export const Hit: React.FC<{ at: number; color?: string; strength?: number; len?: number }> = ({ at, color = "#fff", strength = 0.35, len = 12 }) => {
  const frame = useCurrentFrame();
  const o = frame < at ? 0 : interpolate(frame, [at, at + len], [strength, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

export function alpha(a: number) {
  return Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** Scene wrapper: fade in on the cut, fade + slight push out before the next. */
export const Scene: React.FC<{ duration: number; children: React.ReactNode; push?: boolean }> = ({ duration, children, push = true }) => {
  const frame = useCurrentFrame();
  const i = interpolate(frame, [0, 10], [0, 1], clamp);
  const o = interpolate(frame, [duration - 10, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: i * o, transform: push ? `scale(${1 + (1 - o) * 0.04})` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

export const years = (from: string, to: string | null) => {
  const [y1, m1 = "1"] = from.split("-").map(Number);
  const end = to ? to.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  return (end[0] - y1) * 12 + ((end[1] ?? 1) - Number(m1));
};

export const keys = SCENE_KEYS4;
