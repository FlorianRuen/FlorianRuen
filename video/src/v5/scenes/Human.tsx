import { BikeIcon, ChefHatIcon, MusicIcon, TrendingUpIcon } from "lucide-react";
import type React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, P, WARM } from "../theme";
import { Chip, Flash, pop, rise, Slam, Tag } from "../fx";

const SOFT = D.skills[0].items;
const INTEREST_ICON: Record<string, React.FC<{ size: number; color: string }>> = {
  "Startup investing": TrendingUpIcon,
  Tennis: ({ size }) => <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>🎾</span>,
  "Mountain biking": BikeIcon,
  Music: MusicIcon,
  Cooking: ChefHatIcon,
};

/** Terrain profile: a side-scrolling ridge, the rider stays at x = 560. */
function ground(wx: number) {
  const u = wx / 1000;
  return 820 - (Math.sin(u * 1.7) * 70 + Math.sin(u * 4.3 + 1) * 30 + Math.sin(u * 11) * 10);
}
const SHY_AT = beat(1);
const SKILLS_AT = bar(1.5);
const SKILL_EVERY = beat(1);
const THREE_AT = bar(4);
const RIDER_X = 560;

/**
 * Bars 16-21, the breakdown. Side-scrolling travelling: the landscape
 * scrolls past, the rider pedals in place in the foreground with parallax
 * mountains, stars and a rising sun behind. The shy line on the piano,
 * then one soft skill per beat slamming in big, then the three words and
 * the interests on the build.
 */
export const Human: React.FC<{ copy: Copy5; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const speed = interpolate(frame, [0, SKILLS_AT, THREE_AT], [6, 10, 16], clamp);
  const scroll = frame * speed;
  const dawn = interpolate(frame, [0, bar(5)], [0, 1], clamp);
  const gy = ground(scroll + RIDER_X);
  const slope = (ground(scroll + RIDER_X + 20) - ground(scroll + RIDER_X - 20)) / 40;
  const wheel = frame * 18;
  const current = Math.min(SOFT.length - 1, Math.floor((frame - SKILLS_AT) / SKILL_EVERY));

  const ridgePath = (offset: number, baseY: number, amp: number, parallax: number) => {
    let d = "";
    for (let x = -40; x <= 1960; x += 16) {
      const u = (x + scroll * parallax + offset) / 1000;
      const y = baseY - (Math.sin(u * 1.2) * amp + Math.sin(u * 3.1 + 2) * amp * 0.4 + Math.sin(u * 7.7) * amp * 0.12);
      d += `${x === -40 ? "M" : "L"} ${x} ${y.toFixed(1)} `;
    }
    return `${d}L 1960 1100 L -40 1100 Z`;
  };
  let groundPath = "";
  for (let x = -40; x <= 1960; x += 12) groundPath += `${x === -40 ? "M" : "L"} ${x} ${ground(scroll + x).toFixed(1)} `;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* sky */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${P.bg} 0%, #140d1c ${60 + dawn * 10}%, #3a1a1e 100%)` }} />
      <div style={{ position: "absolute", left: 1350 - 500, top: 560 - dawn * 150 - 500, width: 1000, height: 1000, background: `radial-gradient(circle, ${P.amber}${Math.round(40 + dawn * 80).toString(16).padStart(2, "0")}, transparent 60%)` }} />
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 70 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          <circle key={i} cx={(random(`sx${i}`) * 2200 - scroll * 0.05) % 2000} cy={random(`sy${i}`) * 520} r={1 + random(`sr${i}`) * 1.8} fill={P.fg} opacity={(0.3 + random(`so${i}`) * 0.6) * (1 - dawn * 0.75)} />
        ))}
        <circle cx={1350} cy={560 - dawn * 150} r={80} fill={P.amber} opacity={0.75 + dawn * 0.25} />
        {/* parallax ridges */}
        <path d={ridgePath(0, 620, 110, 0.15)} fill="#1a1226" />
        <path d={ridgePath(400, 700, 90, 0.35)} fill="#231830" />
        <path d={ridgePath(900, 760, 60, 0.6)} fill="#2c1d33" />
        {/* ground */}
        <path d={`${groundPath} L 1960 1100 L -40 1100 Z`} fill="#0c0a12" />
        <path d={groundPath} stroke={P.amber} strokeWidth={3} fill="none" opacity={0.7 + dawn * 0.3} />
        {/* trail stones */}
        {Array.from({ length: 30 }).map((_, i) => {
          const wx = i * 400 + random(`st${i}`) * 300;
          const x = ((wx - scroll) % 2400 + 2400) % 2400 - 200;
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          return <ellipse key={i} cx={x} cy={ground(scroll + x) + 6} rx={8} ry={3} fill={P.amber} opacity={0.5} />;
        })}
        {/* dust behind the wheel */}
        {Array.from({ length: 14 }).map((_, i) => {
          const t = (frame * 1.5 + i * 9) % 40;
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          return <circle key={i} cx={RIDER_X - 50 - t * 4} cy={gy - 6 - t * 0.8 + random(`dy${i}`) * 10} r={2 + t * 0.15} fill={P.amber} opacity={Math.max(0, 0.5 - t / 40)} />;
        })}
      </svg>
      {/* rider */}
      <div style={{ position: "absolute", left: RIDER_X - 70, top: gy - 128, transform: `rotate(${Math.atan(slope) * 57}deg) translateY(${Math.sin(frame / 3) * 2}px)`, transformOrigin: "50% 100%" }}>
        <Rider wheel={wheel} />
      </div>

      <Tag n={4} label={copy.ch.human} accent={P.amber} />

      {/* the shy line, bars 0-1.5 */}
      <div style={{ position: "absolute", left: 120, top: 200, width: 1700 }}>
        <Slam text={copy.shy[0]} at={SHY_AT} until={SKILLS_AT} size={80} weight={500} color={P.muted} stagger={3} />
        <Slam text={copy.shy[1]} at={SHY_AT + beat(2)} until={SKILLS_AT} size={140} gradient={WARM} stagger={3} style={{ marginTop: 10 }} />
      </div>

      {/* soft skills: one per beat, big */}
      {frame >= SKILLS_AT && frame < THREE_AT && (
        <div style={{ position: "absolute", left: 120, top: 200 }}>
          <div style={{ fontFamily: MONO, fontSize: 28, color: P.amber, letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>
            {"// "}
            {copy.likeAtWork} · {String(current + 1).padStart(2, "0")}/{String(SOFT.length).padStart(2, "0")}
          </div>
          {SOFT.map((s, i) => (
            <div key={s.en} style={{ position: "absolute", top: 60 }}>
              <Slam text={t(s, lang)} at={SKILLS_AT + i * SKILL_EVERY} until={i < SOFT.length - 1 ? SKILLS_AT + (i + 1) * SKILL_EVERY : THREE_AT} size={124} stagger={2} outDir={[-200, 0]} style={{ whiteSpace: "nowrap" }} />
            </div>
          ))}
          {/* the past skills, small, stacked on the right */}
          <div style={{ position: "absolute", left: 0, top: 330, width: 1700, display: "flex", flexWrap: "wrap", gap: 8, transform: "scale(0.8)", transformOrigin: "left top" }}>
            {SOFT.slice(0, Math.max(0, current)).map((s, i) => (
              <Chip key={s.en} at={SKILLS_AT + (i + 1) * SKILL_EVERY} color={P.amber}>
                ✓ {t(s, lang)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* the three words + interests */}
      {frame >= THREE_AT && (
        <div style={{ position: "absolute", left: 120, top: 220 }}>
          <div style={{ display: "flex", gap: 30 }}>
            {copy.three.map((w, i) => {
              const s = pop(frame, THREE_AT + i * beat(1), 9);
              const colors = [P.cyan, P.violet, P.amber];
              return (
                <span key={w} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 124, letterSpacing: -5, color: colors[i], display: "inline-block", opacity: Math.min(1, s), transform: `scale(${s})`, textShadow: `0 0 60px ${colors[i]}88` }}>
                  {w}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 40, flexWrap: "wrap", opacity: rise(frame, THREE_AT + beat(3), 8) }}>
            <span style={{ fontFamily: MONO, fontSize: 24, color: P.amber, letterSpacing: 4, textTransform: "uppercase", marginRight: 10 }}>
              {"// "}
              {copy.offDuty}
            </span>
            {D.interests.map((it, i) => {
              const Icon = INTEREST_ICON[it.en];
              const bike = it.en === "Mountain biking";
              return (
                <Chip key={it.en} at={THREE_AT + beat(3) + i * 3} color={bike ? P.amber : P.muted} big>
                  {Icon && <Icon size={26} color={bike ? P.amber : P.fg} />} {t(it, lang)}
                </Chip>
              );
            })}
          </div>
        </div>
      )}
      {copy.three.map((w, i) => (
        <Flash key={w} at={THREE_AT + i * beat(1)} strength={0.25} />
      ))}
    </div>
  );
};

/** Side-view mountain bike with spinning wheels and pedalling legs. */
const Rider: React.FC<{ wheel: number }> = ({ wheel }) => {
  const c = P.fg;
  const ped = wheel * 1.4;
  return (
    <svg aria-hidden="true" width={150} height={130} viewBox="0 0 150 130">
      <g stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g transform={`rotate(${wheel} 30 100)`}>
          <circle cx={30} cy={100} r={26} />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={30} y1={74} x2={30} y2={126} transform={`rotate(${a} 30 100)`} strokeWidth={2} opacity={0.7} />
          ))}
        </g>
        <g transform={`rotate(${wheel} 120 100)`}>
          <circle cx={120} cy={100} r={26} />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={120} y1={74} x2={120} y2={126} transform={`rotate(${a} 120 100)`} strokeWidth={2} opacity={0.7} />
          ))}
        </g>
        {/* frame */}
        <path d="M 30 100 L 62 58 L 100 58 L 120 100 M 62 58 L 75 100 L 30 100 M 75 100 L 100 58 M 100 58 L 104 44 L 116 40 M 62 58 L 58 44" />
        {/* crank + legs */}
        <circle cx={75} cy={100} r={6} />
        <g transform={`rotate(${ped} 75 100)`}>
          <line x1={75} y1={100} x2={75} y2={114} />
          <line x1={75} y1={100} x2={75} y2={86} />
        </g>
        <path d={`M 70 50 L ${75 + Math.cos((ped * Math.PI) / 180) * 12} ${100 + Math.sin((ped * Math.PI) / 180) * 12}`} strokeWidth={5} />
        <path d={`M 70 50 L ${75 - Math.cos((ped * Math.PI) / 180) * 12} ${100 - Math.sin((ped * Math.PI) / 180) * 12}`} strokeWidth={5} opacity={0.6} />
        {/* body, arms, head */}
        <path d="M 70 50 L 92 28 L 112 42" strokeWidth={6} />
        <circle cx={99} cy={16} r={10} fill={c} />
      </g>
    </svg>
  );
};
