import { BrainCircuitIcon, HeartHandshakeIcon, RocketIcon, UsersIcon } from "lucide-react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, GRAD, L, P } from "../theme";
import { Chapter, Hit, rise, Words } from "../ui";

const ICONS = [UsersIcon, RocketIcon, BrainCircuitIcon, HeartHandshakeIcon];
const COLORS = [P.blue, P.violet, P.cyan, P.amber];
const GOAL_AT = (i: number) => bar(1) + i * bar(1);
const CLOSE_AT = bar(5);

/**
 * Bars 21-27: what's next. The drop. A warp of light lines pulls forward,
 * "Where I'm going." lands on the hit, then one ambition per bar, each
 * previous one shrinking into a checked roadmap on the left. Closing line
 * on the last bar.
 */
export const Next: React.FC<{ copy: Copy4 }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const warp = interpolate(frame, [0, bar(1)], [0.3, 1], clamp) * interpolate(frame, [CLOSE_AT, CLOSE_AT + 20], [1, 0.35], clamp);
  const current = Math.min(copy.goals.length - 1, Math.floor((frame - GOAL_AT(0)) / bar(1)));
  const pulse = Math.exp(-((frame % beat(1)) / beat(1)) * 6);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Hit at={0} strength={0.5} />
      {/* warp lines */}
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: warp }}>
        {Array.from({ length: 70 }).map((_, i) => {
          const a = random(`wa${i}`) * Math.PI * 2;
          const speed = 6 + random(`ws${i}`) * 14;
          const len = 40 + random(`wl${i}`) * 160;
          const r = ((frame * speed + random(`wr${i}`) * 1400) % 1400) + 60;
          const cx = 960;
          const cy = 520;
          const x1 = cx + Math.cos(a) * r;
          const y1 = cy + Math.sin(a) * r * 0.62;
          const x2 = cx + Math.cos(a) * (r + len * (r / 900));
          const y2 = cy + Math.sin(a) * (r + len * (r / 900)) * 0.62;
          const color = [P.cyan, P.blue, P.violet, P.fg][i % 4];
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative lines
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={Math.min(0.6, r / 1400) * warp} strokeWidth={1.5 + (r / 1400) * 2} strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 960 - 500, top: 520 - 500, width: 1000, height: 1000, background: `radial-gradient(circle, ${P.violet}${Math.round(30 + pulse * 40).toString(16).padStart(2, "0")}, transparent 55%)`, opacity: warp }} />

      <Chapter index={5} label={copy.chapters.next} accent={P.violet} />

      {/* intro line: bar 0 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center", opacity: interpolate(frame, [bar(1) - 10, bar(1)], [1, 0], clamp) }}>
        <Words text={copy.nextIntro} at={4} size={150} gradient={GRAD} stagger={4} />
      </div>

      {/* roadmap on the left: done goals stack up */}
      {frame >= GOAL_AT(0) && (
        <div style={{ position: "absolute", left: L.left, top: 170, width: 580 }}>
          <div style={{ fontFamily: MONO, fontSize: 20, color: P.muted, letterSpacing: 2, opacity: rise(frame, GOAL_AT(0) + 6, 12), display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: P.violet }}>▸</span> {copy.roadmap}
          </div>
          {copy.goals.map((g, i) => {
            const at = GOAL_AT(i);
            if (frame < at) return null;
            const done = i < current || frame >= CLOSE_AT;
            const s = rise(frame, at, 14);
            const Icon = ICONS[i];
            return (
              <div key={g[0]} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 22, fontFamily: MONO, fontSize: 24, color: done ? P.muted : P.fg, opacity: s, transform: `translateX(${(1 - s) * -30}px)` }}>
                <span style={{ width: 30, height: 30, borderRadius: 7, border: `2px solid ${done ? P.green : COLORS[i]}`, background: done ? `${P.green}33` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: P.green, fontSize: 18, fontWeight: 700 }}>
                  {done ? "✓" : ""}
                </span>
                <Icon size={24} color={done ? P.green : COLORS[i]} />
                <span style={{ textDecoration: done ? "line-through" : "none", textDecorationColor: P.faint }}>
                  {g.join(" ").replace(/,$/, "")}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* the current goal, big, right side */}
      {frame >= GOAL_AT(0) && frame < CLOSE_AT && (
        <GoalCard key={current} i={current} frame={frame - GOAL_AT(current)} copy={copy} />
      )}
      {copy.goals.map((g, i) => (
        <Hit key={g[0]} at={GOAL_AT(i)} color={COLORS[i]} strength={0.12} />
      ))}

      {/* closing */}
      {frame >= CLOSE_AT && (
        <div style={{ position: "absolute", left: 760, top: 340, width: 1100 }}>
          <Words text={copy.closing[0]} at={CLOSE_AT} size={78} />
          <Words text={copy.closing[1]} at={CLOSE_AT + 12} size={78} gradient={GRAD} />
        </div>
      )}
      <Hit at={CLOSE_AT} strength={0.4} />
    </div>
  );
};

const GoalCard: React.FC<{ i: number; frame: number; copy: Copy4 }> = ({ i, frame, copy }) => {
  const Icon = ICONS[i];
  const color = COLORS[i];
  const s = popAt(frame, 0, 12);
  const out = interpolate(frame, [bar(1) - 8, bar(1)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 800, top: 300, width: 980, opacity: Math.min(1, Math.max(0, s)) * out, transform: `translateY(${(1 - Math.min(1, s)) * 50}px) scale(${1 + (1 - out) * 0.05})` }}>
      <div style={{ width: 96, height: 96, borderRadius: 24, background: `${color}22`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${color}55`, marginBottom: 34 }}>
        <Icon size={52} color={color} strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, letterSpacing: -3, lineHeight: 1.08, color: P.fg }}>{copy.goals[i][0]}</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, letterSpacing: -3, lineHeight: 1.08, color, opacity: rise(frame, 8, 14), transform: `translateY(${(1 - rise(frame, 8, 14)) * 20}px)` }}>{copy.goals[i][1]}</div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: P.faint, marginTop: 30, letterSpacing: 2 }}>
        {String(i + 1).padStart(2, "0")} / {String(copy.goals.length).padStart(2, "0")}
      </div>
    </div>
  );
};
