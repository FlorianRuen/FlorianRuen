import { BikeIcon, ChefHatIcon, MusicIcon, TrendingUpIcon } from "lucide-react";
import type React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, L, P, WARM_GRAD } from "../theme";
import { Caption, Chapter, Hit, rise } from "../ui";

const SOFT = D.skills[0].items;
const INTEREST_ICON: Record<string, React.FC<{ size: number; color: string }>> = {
  "Startup investing": TrendingUpIcon,
  Tennis: ({ size, color }) => <span style={{ fontSize: size * 0.9, lineHeight: 1, color }}>🎾</span>,
  "Mountain biking": BikeIcon,
  Music: MusicIcon,
  Cooking: ChefHatIcon,
};

/** Ridge line across the bottom of the frame (px). */
const RIDGE_Y = 900;
function ridge(x: number) {
  const u = x / 1920;
  return RIDGE_Y - (Math.sin(u * 5.2) * 60 + Math.sin(u * 13 + 1) * 24 + Math.sin(u * 31) * 8 + u * 120);
}
const RIDGE_PATH = (() => {
  let d = "";
  for (let x = -20; x <= 1940; x += 10) d += `${x === -20 ? "M" : "L"} ${x} ${ridge(x).toFixed(1)} `;
  return d;
})();
const BACK_PATH = (() => {
  let d = "";
  for (let x = -20; x <= 1940; x += 12) {
    const u = x / 1920;
    d += `${x === -20 ? "M" : "L"} ${x} ${(RIDGE_Y - 140 - Math.sin(u * 3.1 + 2) * 90 - Math.sin(u * 9) * 30 - u * 60).toFixed(1)} `;
  }
  return d;
})();

const SHY_UNTIL = bar(1.5);
const SKILLS_AT = bar(1.5);
const SKILL_EVERY = beat(0.75);
const THREE_AT = bar(3.5);

/**
 * Bars 16-21: who I am. The music breaks down to piano. The honest line
 * first, then every soft skill from the resume rises along a mountain ridge
 * while a bike rides across it, then three words and the interests.
 */
export const Human: React.FC<{ copy: Copy4; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const dawn = interpolate(frame, [0, bar(5)], [0, 1], clamp);
  const bikeX = interpolate(frame, [beat(2), bar(5)], [-80, 2000], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const bikeY = ridge(bikeX);
  const slope = (ridge(bikeX + 8) - ridge(bikeX - 8)) / 16;
  const landscape = rise(frame, 8, 30);
  const skillsOut = interpolate(frame, [THREE_AT - 10, THREE_AT], [1, 0], clamp);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Chapter index={4} label={copy.chapters.human} accent={P.amber} />

      {/* dawn glow + sun */}
      <div style={{ position: "absolute", left: 1500 - 500, top: 640 - 500, width: 1000, height: 1000, background: `radial-gradient(circle, ${P.amber}${Math.round(20 + dawn * 70).toString(16).padStart(2, "0")}, transparent 60%)`, opacity: landscape }} />
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: landscape }}>
        <defs>
          <linearGradient id="ridgeFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={P.bg} />
            <stop offset="1" stopColor="#0b0a12" />
          </linearGradient>
          <linearGradient id="backFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={P.violet} stopOpacity={0.18} />
            <stop offset="1" stopColor={P.bg} stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <circle cx={1500} cy={640 - dawn * 110} r={60} fill={P.amber} opacity={0.5 + dawn * 0.4} />
        <path d={`${BACK_PATH} L 1940 1100 L -20 1100 Z`} fill="url(#backFill)" />
        <path d={`${RIDGE_PATH} L 1940 1100 L -20 1100 Z`} fill="url(#ridgeFill)" />
        <path d={RIDGE_PATH} stroke={P.amber} strokeOpacity={0.5 + dawn * 0.4} strokeWidth={2} fill="none" />
        {/* trail dots along the ridge, lit as the bike passes */}
        {Array.from({ length: 48 }).map((_, i) => {
          const x = 20 + i * 40;
          const lit = bikeX > x;
          return <circle key={x} cx={x} cy={ridge(x) + 10} r={lit ? 3 : 2} fill={lit ? P.amber : P.faint} opacity={lit ? 0.9 : 0.4} />;
        })}
        {/* stars fading with the dawn */}
        {Array.from({ length: 40 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          <circle key={i} cx={random(`sx${i}`) * 1920} cy={random(`sy${i}`) * 500} r={1 + random(`sr${i}`) * 1.5} fill={P.fg} opacity={(0.2 + random(`so${i}`) * 0.5) * (1 - dawn * 0.7) * (frame % 40 < 20 + random(`sb${i}`) * 20 ? 1 : 0.6)} />
        ))}
      </svg>

      {/* rider */}
      <div style={{ position: "absolute", left: bikeX - 30, top: bikeY - 62, transform: `rotate(${Math.atan(slope) * 57}deg)`, opacity: landscape }}>
        <BikeIcon size={60} color={P.fg} strokeWidth={1.8} />
      </div>

      {/* the honest line */}
      <div style={{ position: "absolute", left: L.left, top: 250, opacity: interpolate(frame, [SHY_UNTIL - 10, SHY_UNTIL], [1, 0], clamp) }}>
        <Line at={beat(1)} size={66} weight={500} color={P.muted}>
          {copy.shy[0]}
        </Line>
        <Line at={beat(3)} size={118} gradient={WARM_GRAD} style={{ marginTop: 10 }}>
          {copy.shy[1]}
        </Line>
      </div>

      {/* soft skills rising along the ridge */}
      <div style={{ position: "absolute", inset: 0, opacity: skillsOut }}>
        <div style={{ position: "absolute", left: L.left, top: 250, fontFamily: MONO, fontSize: 26, color: P.amber, letterSpacing: 3, opacity: rise(frame, SKILLS_AT, 12) }}>
          {"// "}
          {copy.howIWork}
        </div>
        {SOFT.map((s, i) => {
          const at = SKILLS_AT + beat(1) + i * SKILL_EVERY;
          if (frame < at) return null;
          const col = i % 3;
          const row = Math.floor(i / 3);
          const p = popAt(frame, at, 10);
          const current = frame < at + SKILL_EVERY;
          return (
            <div
              key={s.en}
              style={{
                position: "absolute",
                left: L.left + col * 540,
                top: 320 + row * 110,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 52,
                letterSpacing: -1.5,
                color: current ? P.fg : "#c9cbd6",
                opacity: Math.min(1, p),
                transform: `translateY(${(1 - Math.min(1, p)) * 30}px)`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: 6, background: P.amber, boxShadow: current ? `0 0 18px ${P.amber}` : "none", opacity: current ? 1 : 0.6 }} />
              {t(s, lang)}
            </div>
          );
        })}
      </div>

      {/* summit: three words + interests */}
      {frame >= THREE_AT && (
        <div style={{ position: "absolute", left: L.left, top: 250 }}>
          <div style={{ display: "flex", gap: 26 }}>
            {copy.three.map((w, i) => {
              const s = popAt(frame, THREE_AT + i * beat(1), 12);
              const colors = [P.cyan, P.violet, P.amber];
              return (
                <span
                  key={w}
                  style={{
                    fontFamily: SANS,
                    fontWeight: 900,
                    fontSize: 96,
                    letterSpacing: -3.5,
                    color: colors[i],
                    display: "inline-block",
                    opacity: Math.max(0, Math.min(1, s)),
                    transform: `translateY(${(1 - Math.min(1, s)) * 40}px) scale(${Math.max(0, s)})`,
                    textShadow: `0 0 50px ${colors[i]}66`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 44 }}>
            <Caption at={THREE_AT + beat(3)} color={P.amber} size={22} style={{ fontFamily: MONO, letterSpacing: 3, marginRight: 10 }}>
              {"// "}
              {copy.offDuty}
            </Caption>
            {D.interests.map((it, i) => {
              const Icon = INTEREST_ICON[it.en];
              const bike = it.en === "Mountain biking";
              const s = rise(frame, THREE_AT + beat(3) + 4 + i * 4, 12);
              return (
                <span
                  key={it.en}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: MONO,
                    fontSize: 24,
                    padding: "10px 18px",
                    borderRadius: 10,
                    color: P.fg,
                    background: bike ? `${P.amber}33` : P.panel,
                    border: `1px solid ${bike ? P.amber : P.line}`,
                    opacity: s,
                    transform: `translateY(${(1 - s) * 16}px)`,
                  }}
                >
                  {Icon && <Icon size={24} color={bike ? P.amber : P.muted} />}
                  {t(it, lang)}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {copy.three.map((w, i) => (
        <Hit key={w} at={THREE_AT + i * beat(1)} strength={0.08} />
      ))}
    </div>
  );
};

const Line: React.FC<{ at: number; size: number; weight?: number; color?: string; gradient?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, size, weight = 900, color = P.fg, gradient, style, children }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, at, 18);
  if (frame < at) return null;
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: size > 80 ? -4 : -1,
        lineHeight: 1.1,
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
        filter: `blur(${(1 - s) * 10}px)`,
        color: gradient ? "transparent" : color,
        backgroundImage: gradient,
        backgroundClip: gradient ? "text" : undefined,
        WebkitBackgroundClip: gradient ? "text" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
