import { BikeIcon, MountainSnowIcon } from "lucide-react";
import type React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import { bar, beat, K } from "../../v2/theme";
import type { Copy3 } from "../copy";

/*
 * Bars 23-36: "who I am", shown as ride telemetry (same visual language as the
 * IDE and dashboard: dark, thin lines, mono labels).
 *   0-1   title (music: piano break)
 *   2-3   the honest line about being shy (still the break)
 *   4-5   the climb starts (build-up)
 *   6-10  every soft skill from the resume, one checkpoint every two beats (drop)
 *   11-12 summit: three words + interests
 */

const SOFT = D.skills[0].items;
const W = 1920;
const X0 = 110;
const X1 = 1810;
const BASE = 930; // screen y of elevation 0
const PEAK = 420; // px of climb
const FLAT = 0.15; // the route is flat until here
const TOP = 0.9; // summit position on the route
const SUMMIT_AT = bar(11) + beat(1);
const CP_AT = SOFT.map((_, i) => bar(6) + i * beat(2));
const WARM = "#fb923c";

/** Route progress (0..1) at a frame: slow on the flat, steady on the drop. */
const routeAt = (f: number) =>
  interpolate(f, [beat(2), bar(4), bar(6), CP_AT[CP_AT.length - 1], SUMMIT_AT], [0, 0.12, 0.26, 0.84, TOP], clamp);

/** Elevation (px) at route position u. */
function elevation(u: number) {
  if (u <= FLAT) return 0;
  if (u <= TOP) {
    const p = (u - FLAT) / (TOP - FLAT);
    const s = p * p * (3 - 2 * p);
    return PEAK * s + Math.sin(u * 70) * 12 * Math.sin(Math.PI * p);
  }
  return PEAK * (1 - ((u - TOP) / (1 - TOP)) ** 1.4 * 0.3);
}
const xAt = (u: number) => X0 + u * (X1 - X0);
const yAt = (u: number) => BASE - elevation(u);

function routePath(from: number, to: number) {
  let d = "";
  const n = Math.max(2, Math.ceil((to - from) * 400));
  for (let i = 0; i <= n; i++) {
    const u = from + ((to - from) * i) / n;
    d += `${i === 0 ? "M" : "L"} ${xAt(u).toFixed(1)} ${yAt(u).toFixed(1)} `;
  }
  return d;
}
const FULL_ROUTE = routePath(0, 1);

/** Topographic contour rings, deterministic. */
const CONTOURS = Array.from({ length: 16 }, (_, k) => {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const r = 120 + k * 58 + Math.sin(a * 3 + k * 0.7) * 26 + Math.sin(a * 5 + random(`c${k}`) * 6) * 14;
    d += `${i === 0 ? "M" : "L"} ${(Math.cos(a) * r * 1.35).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `;
  }
  return `${d}Z`;
});

export const Trail: React.FC<{ copy: Copy3; lang: Lang }> = ({ copy, lang }) => {
  const f = useCurrentFrame();
  const u = routeAt(f);
  const mx = xAt(u);
  const my = yAt(u);
  const total = bar(13);
  const dawn = interpolate(f, [bar(4), SUMMIT_AT], [0, 1], clamp);
  const drawIn = interpolate(f, [4, bar(1)], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const fade = interpolate(f, [0, 14], [0, 1], clamp) * interpolate(f, [total - 10, total], [1, 0], clamp);
  const pulse = f >= bar(6) ? Math.exp(-((f % (bar(1) / 4)) / (bar(1) / 4)) * 5) : 0;
  const cp = CP_AT.filter((a) => f >= a).length - 1;
  const atTop = f >= SUMMIT_AT;
  const pinColor = atTop ? WARM : K.cyan;

  return (
    <AbsoluteFill style={{ opacity: fade, overflow: "hidden", background: K.page }}>
      {/* warm glow rising behind the summit */}
      <div
        style={{
          position: "absolute",
          left: xAt(TOP) - 700,
          top: yAt(TOP) - 700,
          width: 1400,
          height: 1400,
          background: `radial-gradient(circle, ${WARM}${Math.round(10 + dawn * 50)
            .toString(16)
            .padStart(2, "0")}, transparent 60%)`,
        }}
      />
      <div style={{ position: "absolute", width: 1600, height: 1600, left: -300, top: -700, background: `radial-gradient(circle, ${K.blue}22, transparent 60%)` }} />

      <svg aria-hidden="true" width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="route" x1={X0} x2={X1} y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={K.cyan} />
            <stop offset="0.55" stopColor={K.violet} />
            <stop offset="0.9" stopColor={WARM} />
          </linearGradient>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={K.violet} stopOpacity={0.28} />
            <stop offset="1" stopColor={K.violet} stopOpacity={0} />
          </linearGradient>
          <clipPath id="done">
            <rect x={0} y={0} width={mx} height={1080} />
          </clipPath>
        </defs>

        {/* topographic lines */}
        <g transform={`translate(${xAt(TOP) - f * 0.25} ${yAt(TOP) + 40}) rotate(${f * 0.01})`} fill="none" stroke={K.cyan} strokeWidth={1.2}>
          {CONTOURS.map((d, k) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static rings
            <path key={k} d={d} opacity={0.1 - k * 0.004} />
          ))}
        </g>

        {/* chart grid + elevation axis */}
        {[0, 1, 2, 3].map((k) => {
          const y = BASE - (k * PEAK) / 3;
          return (
            <g key={k} opacity={drawIn}>
              <line x1={X0} x2={X1} y1={y} y2={y} stroke={K.border} strokeDasharray="4 8" />
              <text x={X0 - 14} y={y + 6} textAnchor="end" fill={K.faint} fontFamily={MONO} fontSize={16}>
                {k * 400}m
              </text>
            </g>
          );
        })}

        {/* route: the whole thing dim, the ridden part bright */}
        <path d={FULL_ROUTE} stroke={K.faint} strokeWidth={2} fill="none" strokeDasharray="6 8" opacity={0.7 * drawIn} />
        <g clipPath="url(#done)">
          <path d={`${FULL_ROUTE} L ${X1} ${BASE} L ${X0} ${BASE} Z`} fill="url(#area)" />
          <path d={FULL_ROUTE} stroke="url(#route)" strokeWidth={12} fill="none" opacity={0.18} />
          <path d={FULL_ROUTE} stroke="url(#route)" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>

        {/* summit marker */}
        <g opacity={drawIn} transform={`translate(${xAt(TOP)} ${yAt(TOP)})`}>
          <line x1={0} y1={-12} x2={0} y2={-64} stroke={WARM} strokeWidth={2} strokeDasharray="3 4" />
          <text x={0} y={-74} textAnchor="middle" fill={WARM} fontFamily={MONO} fontSize={18} letterSpacing={2}>
            SUMMIT
          </text>
        </g>

        {/* soft skills as checkpoints, labels alternate above / below the route */}
        {SOFT.map((s, i) => {
          const cu = routeAt(CP_AT[i]);
          const x = xAt(cu);
          const y = yAt(cu);
          const passed = f >= CP_AT[i];
          const pop = popAt(f, CP_AT[i], 8);
          const up = i % 2 === 1;
          // The route rises to the right: above-left and below-right of a point are free.
          const ly = up ? y - 40 : y + 46;
          const lx = up ? x - 48 : x + 18;
          const label = interpolate(f, [CP_AT[i], CP_AT[i] + 6], [0, 1], clamp);
          return (
            <g key={s.en}>
              <circle cx={x} cy={y} r={passed ? 7 + (1 - Math.min(1, pop)) * 6 : 5} fill={passed ? K.fg : K.window} stroke={passed ? K.cyan : K.faint} strokeWidth={2.5} />
              {passed && (
                <g opacity={label}>
                  <line x1={x} y1={up ? y - 10 : y + 10} x2={up ? lx + 4 : lx - 4} y2={up ? ly - 6 : ly - 6} stroke={K.border} strokeWidth={1.5} />
                  <text x={lx} y={ly} textAnchor={up ? "end" : "start"} fill={i === cp && f < bar(11) ? K.fg : K.dim} fontFamily={MONO} fontSize={20}>
                    {t(s, lang)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* position marker */}
        <g transform={`translate(${mx} ${my})`}>
          <circle r={14 + pulse * 18} fill="none" stroke={pinColor} strokeWidth={2} opacity={0.5 * (1 - pulse * 0.6)} />
          <circle r={8} fill={K.fg} stroke={pinColor} strokeWidth={3} />
        </g>
      </svg>

      {/* bike pin above the marker */}
      <div
        style={{
          position: "absolute",
          left: mx - 34,
          top: my - 102 - pulse * 6,
          width: 68,
          height: 68,
          borderRadius: 14,
          background: K.panel,
          border: `2px solid ${pinColor}`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 24px ${pinColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: drawIn,
        }}
      >
        {atTop ? <MountainSnowIcon size={38} color={WARM} strokeWidth={1.8} /> : <BikeIcon size={40} color={K.fg} strokeWidth={1.8} />}
        <div
          style={{
            position: "absolute",
            bottom: -9,
            left: 25,
            width: 14,
            height: 14,
            background: K.panel,
            borderRight: `2px solid ${pinColor}`,
            borderBottom: `2px solid ${pinColor}`,
            transform: "rotate(45deg)",
          }}
        />
      </div>

      <Hud frame={f} u={u} />

      {/* texts */}
      <Title frame={f} copy={copy} />
      <Shy frame={f} copy={copy} />
      <Caption at={bar(4) + beat(1)} until={bar(6) - 4} frame={f}>
        {copy.likeAtWork}
      </Caption>
      {cp >= 0 && f < bar(11) && <Skill key={cp} i={cp} frame={f - CP_AT[cp]} copy={copy} lang={lang} />}
      <Summit frame={f - bar(11)} copy={copy} lang={lang} />
    </AbsoluteFill>
  );
};

/** Bike-computer readout, styled like the dashboard panels. */
const Hud: React.FC<{ frame: number; u: number }> = ({ frame, u }) => {
  const o = interpolate(frame, [bar(2), bar(2) + 10], [0, 1], clamp) * interpolate(frame, [bar(11), bar(11) + 10], [1, 0.4], clamp);
  const kmh = frame < SUMMIT_AT ? 14 + interpolate(frame, [bar(4), bar(6)], [0, 13], clamp) + Math.sin(frame / 7) * 0.5 : 0;
  const item = (label: string, value: string, color: string) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 15, color: K.dim, letterSpacing: 2 }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 700, color }}>{value}</span>
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: 50,
        display: "flex",
        gap: 32,
        padding: "14px 24px",
        borderRadius: 10,
        background: K.panel,
        border: `1px solid ${K.border}`,
        fontFamily: MONO,
        opacity: o,
      }}
    >
      {item("♥ BPM", "128", K.red)}
      {item("D+", `${Math.round((elevation(Math.min(u, TOP)) / PEAK) * 1200)} m`, K.yellow)}
      {item("KM/H", kmh.toFixed(1), K.cyan)}
      {item("DIST", `${(u * 42).toFixed(1)} km`, K.fg)}
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <div style={{ fontFamily: MONO, fontSize: 26, color: K.comment, letterSpacing: 3, opacity }}>{children}</div>
);

const Title: React.FC<{ frame: number; copy: Copy3 }> = ({ frame, copy }) => {
  const k = interpolate(frame, [6, 14], [0, 1], clamp);
  const l1 = popAt(frame, 14, 12);
  const l2 = popAt(frame, beat(2), 12);
  const out = interpolate(frame, [bar(2) - 10, bar(2)], [1, 0], clamp);
  if (out <= 0) return null;
  const line = (p: number): React.CSSProperties => ({
    fontFamily: SANS,
    fontWeight: 900,
    fontSize: 110,
    letterSpacing: -4,
    lineHeight: 1.05,
    opacity: Math.max(0, Math.min(1, p)),
    transform: `translateY(${(1 - Math.min(1, p)) * 30}px)`,
  });
  return (
    <div style={{ position: "absolute", top: 150, left: 140, opacity: out }}>
      <Kicker opacity={k}>{"// "}{copy.trailKicker}</Kicker>
      <div style={{ ...line(l1), color: K.fg, marginTop: 14 }}>{copy.offTitle[0]}</div>
      <div style={{ ...line(l2), color: K.cyan }}>{copy.offTitle[1]}</div>
    </div>
  );
};

/** The honest line, on the quiet part of the music. */
const Shy: React.FC<{ frame: number; copy: Copy3 }> = ({ frame, copy }) => {
  const a = interpolate(frame, [bar(2), bar(2) + 16], [0, 1], clamp);
  const b = popAt(frame, bar(3), 14);
  const out = interpolate(frame, [bar(4) - 8, bar(4) + 4], [1, 0], clamp);
  if (frame < bar(2) || out <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 170, left: 140, opacity: out }}>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 70, color: K.dim, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, letterSpacing: -1 }}>
        {copy.shyLine[0]}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 108,
          letterSpacing: -4,
          marginTop: 6,
          opacity: Math.max(0, Math.min(1, b)),
          transform: `translateY(${(1 - Math.min(1, b)) * 30}px)`,
          backgroundImage: `linear-gradient(90deg, ${K.cyan}, ${K.violet} 55%, ${WARM})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {copy.shyLine[1]}
      </div>
    </div>
  );
};

const Caption: React.FC<{ at: number; until: number; frame: number; children: React.ReactNode }> = ({ at, until, frame, children }) => {
  const o = interpolate(frame, [at, at + 10, until - 8, until], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 190, left: 140, fontFamily: SANS, fontWeight: 800, fontSize: 80, color: K.fg, letterSpacing: -2, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
      {children}
    </div>
  );
};

/** The current soft skill, big, on its beat (frame relative to its checkpoint). */
const Skill: React.FC<{ i: number; frame: number; copy: Copy3; lang: Lang }> = ({ i, frame, copy, lang }) => {
  const s = popAt(frame, 0, 8);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ position: "absolute", top: 150, left: 140 }}>
      <Kicker>
        {"// "}{copy.softKicker} · <span style={{ color: K.cyan }}>{pad(i + 1)}</span>/{pad(SOFT.length)}
      </Kicker>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 120,
          letterSpacing: -4,
          color: K.fg,
          marginTop: 8,
          opacity: Math.max(0, Math.min(1, s)),
          transform: `translateX(${(1 - Math.min(1, s)) * -40}px)`,
        }}
      >
        {t(SOFT[i], lang)}
      </div>
    </div>
  );
};

const INTEREST_EMOJI: Record<string, string> = {
  "Startup investing": "📈",
  Tennis: "🎾",
  "Mountain biking": "🚵",
  Music: "🎵",
  Cooking: "🍳",
};

/** Summit: the three words on the beats, then the interests (frame relative to bar 11). */
const Summit: React.FC<{ frame: number; copy: Copy3; lang: Lang }> = ({ frame, copy, lang }) => {
  if (frame < 0) return null;
  const chips = interpolate(frame, [beat(3.5), beat(3.5) + 12], [0, 1], clamp);
  const colors = [K.cyan, K.violet, WARM];
  return (
    <div style={{ position: "absolute", top: 120, left: 140 }}>
      <div style={{ display: "flex", gap: 30 }}>
        {copy.summit.map((w, i) => {
          const s = popAt(frame, beat(i + 1), 10);
          return (
            <span
              key={w}
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 100,
                letterSpacing: -3,
                color: colors[i],
                display: "inline-block",
                transform: `translateY(${(1 - Math.min(1, s)) * 40}px) scale(${s})`,
                opacity: Math.max(0, Math.min(1, s)),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, opacity: chips, transform: `translateY(${(1 - chips) * 20}px)` }}>
        <span style={{ fontFamily: MONO, fontSize: 22, color: K.comment, letterSpacing: 2, marginRight: 8 }}>{"// "}{copy.offDuty}</span>
        {D.interests.map((it) => {
          const bike = it.en === "Mountain biking";
          return (
            <span
              key={it.en}
              style={{
                fontFamily: MONO,
                fontSize: 22,
                padding: "6px 16px",
                borderRadius: 6,
                color: K.fg,
                background: bike ? `${WARM}33` : "rgba(168,85,247,0.15)",
                border: `1px solid ${bike ? WARM : `${K.violet}66`}`,
              }}
            >
              {INTEREST_EMOJI[it.en] ?? "•"} {t(it, lang)}
            </span>
          );
        })}
      </div>
    </div>
  );
};
