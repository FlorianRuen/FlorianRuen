import { BrainCircuitIcon, HeartHandshakeIcon, RocketIcon, UsersIcon } from "lucide-react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, GRAD, P } from "../theme";
import { Flash, kick, pop, rise, Slam, Tag } from "../fx";

const ICONS = [UsersIcon, RocketIcon, BrainCircuitIcon, HeartHandshakeIcon];
const COLORS = [P.blue, P.violet, P.cyan, P.amber];
const GOAL_AT = (i: number) => bar(1) + i * bar(1);

/**
 * Bars 21-26, the second drop. A tunnel of light rings rushing at the camera,
 * accelerating. "Where I'm going." on the hit, then one ambition per bar,
 * each slamming from depth on its kick and flying off to the side on the next.
 */
export const Next: React.FC<{ copy: Copy5 }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const k = kick(frame);
  const speed = interpolate(frame, [0, bar(5)], [26, 60], clamp);
  const z0 = frame * speed;
  const current = Math.min(copy.goals.length - 1, Math.floor((frame - GOAL_AT(0)) / bar(1)));
  const hue = COLORS[Math.max(0, current)];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* tunnel rings */}
        {Array.from({ length: 22 }).map((_, i) => {
          const z = ((i * 300 - z0) % 6600 + 6600) % 6600 + 120;
          const s = 900 / z;
          const r = 1500 * s;
          const col = i % 2 ? P.violet : hue;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional
            <ellipse key={i} cx={960} cy={540} rx={r} ry={r * 0.62} fill="none" stroke={col} strokeOpacity={Math.min(0.5, s * 1.4) * (0.6 + k * 0.4)} strokeWidth={2 + s * 20} />
          );
        })}
        {/* streaks */}
        {Array.from({ length: 90 }).map((_, i) => {
          const a = random(`ta${i}`) * Math.PI * 2;
          const d = 0.25 + random(`td${i}`) * 0.75;
          const z = ((random(`tz${i}`) * 5000 - z0 * 1.4) % 5000 + 5000) % 5000 + 60;
          const s1 = 900 / z;
          const s2 = 900 / (z + 500);
          const x1 = 960 + Math.cos(a) * 1500 * d * s1;
          const y1 = 540 + Math.sin(a) * 930 * d * s1;
          const x2 = 960 + Math.cos(a) * 1500 * d * s2;
          const y2 = 540 + Math.sin(a) * 930 * d * s2;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={[P.cyan, P.fg, P.violet][i % 3]} strokeOpacity={Math.min(0.9, s1 * 1.2)} strokeWidth={1.5 + s1 * 6} strokeLinecap="round" />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 960 - 500, top: 540 - 500, width: 1000, height: 1000, background: `radial-gradient(circle, ${hue}${Math.round(60 + k * 70).toString(16).padStart(2, "0")}, transparent 55%)` }} />

      <Tag n={5} label={copy.ch.next} accent={P.violet} />

      {/* bar 0 */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Slam text={copy.nextIntro} at={2} until={GOAL_AT(0)} size={200} gradient={GRAD} stagger={beat(0.5)} align="center" outDir={[0, 0]} />
      </div>
      <Flash at={0} strength={0.7} len={10} />

      {/* one goal per bar */}
      {copy.goals.map((g, i) => {
        const at = GOAL_AT(i);
        const Icon = ICONS[i];
        const color = COLORS[i];
        const icon = pop(frame, at, 8);
        const gone = i < 3 && frame >= GOAL_AT(i + 1);
        if (frame < at || gone) return null;
        return (
          <div key={g[0]} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 120, height: 120, borderRadius: 30, background: `${color}22`, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${color}88`, marginBottom: 40, opacity: Math.min(1, icon), transform: `scale(${icon}) rotate(${(1 - Math.min(1, icon)) * 90}deg)` }}>
              <Icon size={64} color={color} strokeWidth={1.8} />
            </div>
            <Slam text={g[0]} at={at + 2} until={i < 3 ? GOAL_AT(i + 1) : undefined} size={116} stagger={2} align="center" outDir={[i % 2 ? 600 : -600, 0]} />
            <Slam text={g[1]} at={at + beat(0.75)} until={i < 3 ? GOAL_AT(i + 1) : undefined} size={116} color={color} stagger={2} align="center" outDir={[i % 2 ? 600 : -600, 0]} style={{ marginTop: 10 }} />
            <div style={{ fontFamily: MONO, fontSize: 26, color: P.muted, letterSpacing: 6, marginTop: 50, opacity: rise(frame, at + beat(1.5), 8) }}>
              {String(i + 1).padStart(2, "0")} / {String(copy.goals.length).padStart(2, "0")}
            </div>
          </div>
        );
      })}
      {copy.goals.map((g, i) => (
        <Flash key={g[0]} at={GOAL_AT(i)} color={COLORS[i]} strength={0.4} len={8} />
      ))}
      {/* ticks of the done goals, bottom left */}
      <div style={{ position: "absolute", left: 120, bottom: 100, display: "flex", gap: 14 }}>
        {copy.goals.map((g, i) => {
          const done = frame >= GOAL_AT(i);
          return (
            <span key={g[0]} style={{ width: 54, height: 8, borderRadius: 4, background: done ? COLORS[i] : P.line, boxShadow: done ? `0 0 16px ${COLORS[i]}` : "none", transform: `scaleX(${done ? pop(frame, GOAL_AT(i), 8) : 1})` }} />
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 96, fontFamily: SANS, fontWeight: 800, fontSize: 24, color: P.muted, letterSpacing: 2, textTransform: "uppercase", opacity: rise(frame, GOAL_AT(0), 8) }}>
        roadmap · {Math.min(copy.goals.length, Math.max(0, current + 1))}/{copy.goals.length}
      </div>
    </div>
  );
};
