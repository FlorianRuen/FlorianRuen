import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEAT, C, GRADIENT, MONO } from "./theme";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** 1 on each beat, decaying to 0 before the next one. `frame` is absolute. */
export function beatPulse(frame: number, every = BEAT) {
  const p = (frame % every) / every;
  return Math.exp(-p * 6);
}

/** Spring from 0 to 1 starting at `delay` frames (scene-relative). */
export function useEnter(delay = 0, config = { damping: 14, stiffness: 160 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}

/**
 * Perspective grid floor, glow blobs and drifting particles: the moving
 * background shared by every scene. Uses the absolute frame so it never
 * jumps between scenes.
 */
export const Background: React.FC<{ frame: number; intensity?: number }> = ({
  frame,
  intensity = 1,
}) => {
  const pulse = beatPulse(frame, BEAT * 2) * intensity;
  const offset = (frame * 2.2) % 80;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {/* glow blobs */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -300 + Math.sin(frame / 90) * 120,
          top: -500 + Math.cos(frame / 110) * 80,
          background: `radial-gradient(circle, ${C.primary}55, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          right: -350 + Math.cos(frame / 100) * 120,
          bottom: -500 + Math.sin(frame / 80) * 80,
          background: `radial-gradient(circle, ${C.violet}40, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* perspective grid */}
      <div
        style={{
          position: "absolute",
          left: "-50%",
          right: "-50%",
          top: "55%",
          height: "90%",
          transform: "perspective(500px) rotateX(62deg)",
          transformOrigin: "top center",
          backgroundImage: `linear-gradient(${C.blue}${hexA(0.28 + pulse * 0.35)} 2px, transparent 2px), linear-gradient(90deg, ${C.blue}${hexA(0.22 + pulse * 0.3)} 2px, transparent 2px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `0 ${offset}px`,
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 60%, transparent)",
        }}
      />
      {/* horizon line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "55%",
          height: 2,
          background: GRADIENT,
          opacity: 0.4 + pulse * 0.5,
          boxShadow: `0 0 ${20 + pulse * 40}px ${C.cyan}`,
        }}
      />
      {/* particles */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = random(`x${i}`) * 1920;
        const speed = 0.5 + random(`s${i}`) * 1.5;
        const y = (random(`y${i}`) * 1200 - frame * speed) % 1200;
        const size = 2 + random(`z${i}`) * 3;
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative list
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < 0 ? y + 1200 : y,
              width: size,
              height: size,
              borderRadius: size,
              background: i % 3 === 0 ? C.violet : C.cyan,
              opacity: 0.25 + random(`o${i}`) * 0.4,
            }}
          />
        );
      })}
      {/* vignette + scanlines */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7))",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)",
        }}
      />
    </AbsoluteFill>
  );
};

function hexA(alpha: number) {
  return Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** Small mono label like the website's section titles: "// the journey". */
export const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const s = useEnter(delay);
  const text = String(children);
  const shown = Math.floor(interpolate(frame - delay, [0, 14], [0, text.length], clamp));
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 30,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: C.cyan,
        opacity: s,
        transform: `translateX(${(1 - s) * -40}px)`,
      }}
    >
      <span style={{ color: C.muted }}>{"// "}</span>
      {text.slice(0, shown)}
      <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>_</span>
    </div>
  );
};

/** Text with an RGB-split glitch for the first frames after `at`. */
export const Glitch: React.FC<{
  children: React.ReactNode;
  at?: number;
  length?: number;
  style?: React.CSSProperties;
}> = ({ children, at = 0, length = 12, style }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const active = t >= 0 && t < length;
  const amt = active ? (1 - t / length) * 14 : 0;
  const jx = active ? (random(`gx${frame}`) - 0.5) * amt * 2 : 0;
  const slice = active ? random(`gs${frame}`) * 100 : 0;
  return (
    <div style={{ position: "relative", ...style }}>
      {active && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              color: C.cyan,
              transform: `translate(${-amt}px, 0)`,
              mixBlendMode: "screen",
              clipPath: `inset(${slice}% 0 ${Math.max(0, 70 - slice)}% 0)`,
            }}
          >
            {children}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              color: "#ff2bd6",
              transform: `translate(${amt}px, 0)`,
              mixBlendMode: "screen",
            }}
          >
            {children}
          </div>
        </>
      )}
      <div style={{ position: "relative", transform: `translateX(${jx}px)` }}>{children}</div>
    </div>
  );
};

/** White flash at the start of a scene, to punch the cut on the beat. */
export const Flash: React.FC<{ length?: number; strength?: number }> = ({
  length = 8,
  strength = 0.55,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, length], [strength, 0], clamp);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** Scene wrapper: quick zoom-in on enter and blur-out on exit. */
export const SceneShell: React.FC<{
  duration: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ duration, children, style }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], clamp);
  const exit = interpolate(frame, [duration - 8, duration], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transform: `scale(${1.06 - enter * 0.06 + exit * 0.08})`,
        filter: `blur(${exit * 12}px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const GradientText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <span
    style={{
      backgroundImage: GRADIENT,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

/** 0 → 1 with an ease-out-back overshoot over `length` frames from `at`. Safe inside loops. */
export function popAt(frame: number, at: number, length = 10) {
  const x = interpolate(frame, [at, at + length], [0, 1], clamp);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}
