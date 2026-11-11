import { NewspaperIcon, TrophyIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, P } from "../theme";
import { Chip, Flash, kick, pop, rise, Slam, Tag } from "../fx";

const EYESR = D.work.find((w) => w.company === "Eyes'R");
if (!EYESR || !("press" in EYESR)) throw new Error("Eyes'R entry missing");
const PRESS = EYESR.press.items.length;

const ALERT_AT = bar(2);
const AWARD_AT = bar(3);

/**
 * Bars 4-8, the drop. The whole frame IS the camera feed: a warehouse in
 * perspective, the camera slowly dollying forward, detections popping on
 * the beat. Bar 2: the helmet detection goes red, the frame flashes red,
 * "alert sent". Bar 3: the award slams in over a gold flash.
 */
export const Spark: React.FC<{ copy: Copy5; lang: Lang }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const dolly = 1 + interpolate(frame, [0, bar(4)], [0, 0.18], clamp);
  const risk = frame >= ALERT_AT;
  const alert = pop(frame, ALERT_AT, 8);
  const award = pop(frame, AWARD_AT, 10);
  const scan = ((frame * 9) % 1200) - 60;
  const walker = 560 + Math.min(frame, ALERT_AT) * 3.2;
  const bob = Math.sin(frame / 2.5) * 4;
  const forkX = 1500 - frame * 1.1;
  const redTint = risk ? 0.35 + kick(frame) * 0.2 : 0;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* the warehouse, in perspective, with the camera pushing in */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${dolly})`, transformOrigin: "50% 60%" }}>
        <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="spFloor" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={P.violet} stopOpacity={0.05} />
              <stop offset="1" stopColor={P.violet} stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="spZone" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={P.red} stopOpacity={0.1} />
              <stop offset="1" stopColor={P.red} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <rect x={0} y={560} width={1920} height={520} fill="url(#spFloor)" />
          {Array.from({ length: 17 }).map((_, i) => {
            const x = (i / 16) * 1920;
            return <line key={`v${x}`} x1={x} y1={560} x2={960 + (x - 960) * 3.2} y2={1080} stroke={P.fg} strokeOpacity={0.09} strokeWidth={1.5} />;
          })}
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 560 + ((i / 8) ** 1.7) * 520;
            return <line key={`h${y}`} x1={0} y1={y} x2={1920} y2={y} stroke={P.fg} strokeOpacity={0.09} strokeWidth={1.5} />;
          })}
          {/* shelving */}
          {[120, 420, 1240, 1540].map((x) => (
            <g key={x} stroke={P.fg} strokeOpacity={0.2} strokeWidth={2} fill="rgba(255,255,255,0.02)">
              <rect x={x} y={160} width={260} height={400} />
              {[250, 340, 430].map((y) => (
                <line key={y} x1={x} y1={y} x2={x + 260} y2={y} />
              ))}
              {[30, 110, 190].map((d) => (
                <rect key={d} x={x + d} y={270} width={60} height={60} fill={P.fg} fillOpacity={0.06} />
              ))}
            </g>
          ))}
          {/* risk zone on the floor */}
          <polygon points="700,640 1260,640 1500,1000 460,1000" fill="url(#spZone)" stroke={P.red} strokeOpacity={0.8} strokeWidth={3} strokeDasharray="14 12" />
          <text x={720} y={625} fontFamily={MONO} fontSize={24} fill={P.red} letterSpacing={4} fontWeight={700}>
            {copy.labels.zone.toUpperCase()}
          </text>

          {/* forklift */}
          <g transform={`translate(${forkX} 760) scale(1.8)`} fill={P.fg} fillOpacity={0.85}>
            <rect x={0} y={-70} width={110} height={56} rx={8} />
            <rect x={20} y={-100} width={50} height={34} rx={6} fillOpacity={0.5} />
            <rect x={110} y={-84} width={8} height={90} rx={2} />
            <rect x={118} y={-4} width={46} height={6} rx={2} />
            <circle cx={24} cy={-8} r={14} fill={P.bg} stroke={P.fg} strokeWidth={5} />
            <circle cx={88} cy={-8} r={14} fill={P.bg} stroke={P.fg} strokeWidth={5} />
          </g>
          {/* worker walking into the zone */}
          <g transform={`translate(${walker} ${780 + bob}) scale(2)`} fill={P.fg} fillOpacity={0.95}>
            <circle cx={0} cy={-112} r={14} />
            <rect x={-16} y={-96} width={32} height={60} rx={10} />
            <rect x={-14} y={-40} width={11} height={44} rx={5} transform={`rotate(${Math.sin(frame / 2.5) * 18} -8 -40)`} />
            <rect x={3} y={-40} width={11} height={44} rx={5} transform={`rotate(${-Math.sin(frame / 2.5) * 18} 8 -40)`} />
          </g>

          {/* detections */}
          <Box at={beat(2)} frame={frame} x={forkX - 30} y={760 - 190} w={330} h={200} color={P.cyan} label={`${copy.labels.forklift} 0.94`} />
          <Box at={beat(4)} frame={frame} x={walker - 60} y={780 - 250} w={120} h={290} color={risk ? P.red : P.green} label={risk ? `${copy.labels.helmet} 0.91` : `${copy.labels.person} 0.98`} />
          <Box at={beat(6)} frame={frame} x={walker - 36} y={780 - 258} w={72} h={56} color={risk ? P.red : P.cyan} label="" />

          {/* scan line */}
          <rect x={0} y={scan} width={1920} height={90} fill={P.cyan} opacity={0.04} />
          <line x1={0} y1={scan + 90} x2={1920} y2={scan + 90} stroke={P.cyan} strokeOpacity={0.35} strokeWidth={2} />
        </svg>
      </div>

      {/* darken the set under the award */}
      <div style={{ position: "absolute", inset: 0, background: P.bg, opacity: frame >= AWARD_AT ? Math.min(0.6, award * 0.6) : 0, pointerEvents: "none" }} />
      {/* red tint on alert */}
      <div style={{ position: "absolute", inset: 0, background: P.red, opacity: redTint * 0.25, pointerEvents: "none" }} />

      {/* HUD */}
      <div style={{ position: "absolute", right: 120, top: 100, display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 26, color: P.fg, letterSpacing: 3 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: P.red, opacity: frame % 30 < 18 ? 1 : 0.2 }} />
        {copy.rec} <span style={{ color: P.muted }}>{copy.cam}</span>
        <span style={{ color: P.muted, marginLeft: 20 }}>
          {`${String(Math.floor(frame / 30) % 60).padStart(2, "0")}:${String(frame % 30).padStart(2, "0")}`}
        </span>
      </div>
      {[0, 90, 180, 270].map((r, i) => (
        <div key={r} style={{ position: "absolute", left: i === 0 || i === 3 ? 80 : 1920 - 80 - 50, top: i < 2 ? 80 : 1080 - 80 - 50, width: 50, height: 50, borderLeft: `3px solid ${P.fg}66`, borderTop: `3px solid ${P.fg}66`, transform: `rotate(${r}deg)` }} />
      ))}

      <Tag n={1} label={copy.ch.spark} accent={P.violet} />

      {/* title: bars 0-2 */}
      <div style={{ position: "absolute", left: 120, top: 190, width: 1500 }}>
        <Slam text={copy.sparkTitle[0]} at={4} until={ALERT_AT} size={92} stagger={3} />
        <Slam text={copy.sparkTitle[1]} at={beat(2)} until={ALERT_AT} size={92} gradient={`linear-gradient(90deg, ${P.violet}, ${P.pink})`} stagger={3} />
      </div>
      {/* keyword punches under the title, one per beat on bar 1 */}
      <div style={{ position: "absolute", left: 120, top: 420, display: "flex", gap: 16 }}>
        {copy.sparkWords.map((w, i) => (
          <div key={w} style={{ opacity: interpolate(frame, [ALERT_AT - 5, ALERT_AT], [1, 0], clamp) }}>
            <Chip at={bar(1) + i * beat(1)} color={P.violet} big>
              {w}
            </Chip>
          </div>
        ))}
      </div>

      {/* alert: bar 2 */}
      {frame >= ALERT_AT && frame < AWARD_AT && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, alert), transform: `scale(${alert})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: -7, color: P.fg, textShadow: `0 0 80px ${P.red}` }}>⚠ {copy.labels.helmet}</div>
          <div style={{ fontFamily: MONO, fontSize: 40, color: P.fg, background: P.red, padding: "10px 30px", borderRadius: 8, marginTop: 16, letterSpacing: 2, fontWeight: 700 }}>{copy.alert}</div>
        </div>
      )}
      <Flash at={ALERT_AT} color={P.red} strength={0.5} len={10} />

      {/* award: bar 3 */}
      {frame >= AWARD_AT && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, award), transform: `scale(${award})` }}>
          <TrophyIcon size={120} color={P.gold} strokeWidth={1.6} style={{ filter: `drop-shadow(0 0 40px ${P.gold})` }} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: -4, color: P.gold, marginTop: 10, textAlign: "center", lineHeight: 1 }}>{copy.award}</div>
          <div style={{ fontFamily: MONO, fontSize: 36, color: P.fg, marginTop: 22, letterSpacing: 2 }}>2021</div>
          <div style={{ fontFamily: SANS, fontSize: 32, color: P.muted, marginTop: 20, opacity: rise(frame, AWARD_AT + beat(1), 8) }}>{copy.finalist}</div>
          <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
            <Chip at={AWARD_AT + beat(2)} color={P.gold} big>
              <NewspaperIcon size={26} color={P.gold} /> {copy.media(PRESS)}
            </Chip>
            <Chip at={AWARD_AT + beat(2.5)} color={P.gold} big>
              {copy.helm}
            </Chip>
          </div>
        </div>
      )}
      <Flash at={AWARD_AT} color={P.gold} strength={0.45} len={10} />
    </div>
  );
};

const Box: React.FC<{ at: number; frame: number; x: number; y: number; w: number; h: number; color: string; label: string }> = ({ at, frame, x, y, w, h, color, label }) => {
  if (frame < at) return null;
  const s = interpolate(frame, [at, at + 6], [0, 1], clamp);
  const c = 26 * s;
  const sw = 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} opacity={0.1 * s} />
      <path d={`M ${x} ${y + c} V ${y} H ${x + c}`} stroke={color} strokeWidth={sw} fill="none" />
      <path d={`M ${x + w - c} ${y} H ${x + w} V ${y + c}`} stroke={color} strokeWidth={sw} fill="none" />
      <path d={`M ${x + w} ${y + h - c} V ${y + h} H ${x + w - c}`} stroke={color} strokeWidth={sw} fill="none" />
      <path d={`M ${x + c} ${y + h} H ${x} V ${y + h - c}`} stroke={color} strokeWidth={sw} fill="none" />
      <rect x={x} y={y} width={w} height={h} stroke={color} strokeOpacity={0.5 * s} fill="none" strokeWidth={1.5} />
      {label && (
        <g opacity={interpolate(frame, [at + 4, at + 9], [0, 1], clamp)}>
          <rect x={x} y={y - 38} width={label.length * 13.5 + 20} height={34} rx={4} fill={color} />
          <text x={x + 10} y={y - 13} fontFamily={MONO} fontSize={21} fontWeight={700} fill={P.bg}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};
