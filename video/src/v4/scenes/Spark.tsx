import { NewspaperIcon, TrophyIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { formatDate, type Lang } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, L, P } from "../theme";
import { Caption, Chapter, Chip, Hit, rise, Words } from "../ui";

const EYESR = D.work.find((w) => w.company === "Eyes'R");
if (!EYESR || !("press" in EYESR)) throw new Error("Eyes'R entry missing");
const PRESS = EYESR.press.items.length;
const ROLE = EYESR.roles[0];

/** Camera viewport geometry (px, in the 1920x1080 frame). */
const CAM = { x: 1010, y: 170, w: 770, h: 480 };

/**
 * Bars 4-8: the spark. A warehouse camera feed draws itself, detections pop
 * one per beat, a missing helmet turns red and raises the alert, then the
 * award card lands on bar 3.
 */
export const Spark: React.FC<{ copy: Copy4; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const cam = rise(frame, 20, 22);
  const scan = ((frame * 4) % (CAM.h + 60)) - 30;
  const boxAt = [beat(4), beat(5), beat(6)];
  const riskAt = beat(7.5);
  const alertAt = riskAt + 10;
  const risk = frame >= riskAt;
  const alert = rise(frame, alertAt, 10);
  const awardAt = bar(2.6);
  const award = rise(frame, awardAt, 16);
  const blink = frame % 30 < 18;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Hit at={0} strength={0.3} />
      <Chapter index={1} label={copy.chapters.spark} meta={`${formatDate(ROLE.start, lang)} → ${formatDate(ROLE.end, lang)}`} accent={P.violet} />

      <div style={{ position: "absolute", left: L.left, top: 150, width: 840 }}>
        <Words text={copy.sparkTitle[0]} at={14} size={66} />
        <Words text={copy.sparkTitle[1]} at={30} size={66} gradient={`linear-gradient(90deg, ${P.violet}, ${P.pink})`} />
        <Caption at={beat(3)} size={28} style={{ marginTop: 26, maxWidth: 760 }}>
          {copy.sparkSub}
        </Caption>
      </div>

      {/* camera feed */}
      <div
        style={{
          position: "absolute",
          left: CAM.x,
          top: CAM.y,
          width: CAM.w,
          height: CAM.h,
          borderRadius: 14,
          overflow: "hidden",
          background: "#0a0c14",
          border: `1px solid ${P.line}`,
          boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 80px ${P.violet}22`,
          opacity: cam,
          transform: `perspective(1600px) rotateY(${(1 - cam) * -14}deg) translateX(${(1 - cam) * 80}px)`,
        }}
      >
        <svg aria-hidden="true" width={CAM.w} height={CAM.h} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={P.violet} stopOpacity={0} />
              <stop offset="1" stopColor={P.violet} stopOpacity={0.18} />
            </linearGradient>
            <linearGradient id="zone" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={P.red} stopOpacity={0.25} />
              <stop offset="1" stopColor={P.red} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {/* perspective floor */}
          <rect x={0} y={CAM.h * 0.55} width={CAM.w} height={CAM.h * 0.45} fill="url(#floor)" />
          {Array.from({ length: 9 }).map((_, i) => {
            const x = (i / 8) * CAM.w;
            return <line key={`v${x}`} x1={x} y1={CAM.h * 0.55} x2={CAM.w / 2 + (x - CAM.w / 2) * 2.4} y2={CAM.h} stroke={P.fg} strokeOpacity={0.06} />;
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const y = CAM.h * 0.55 + ((i / 5) ** 1.6) * CAM.h * 0.45;
            return <line key={`h${y}`} x1={0} y1={y} x2={CAM.w} y2={y} stroke={P.fg} strokeOpacity={0.06} />;
          })}
          {/* shelving in the back */}
          {[90, 250, 410, 570].map((x) => (
            <g key={x} stroke={P.fg} strokeOpacity={0.14} fill="none">
              <rect x={x} y={70} width={110} height={CAM.h * 0.55 - 70} />
              <line x1={x} y1={130} x2={x + 110} y2={130} />
              <line x1={x} y1={190} x2={x + 110} y2={190} />
            </g>
          ))}
          {/* risk zone */}
          <polygon points={`380,${CAM.h * 0.6} 700,${CAM.h * 0.6} 760,${CAM.h - 20} 300,${CAM.h - 20}`} fill="url(#zone)" stroke={P.red} strokeOpacity={0.6} strokeDasharray="8 8" strokeWidth={1.5} />
          <text x={400} y={CAM.h * 0.6 - 10} fontFamily={MONO} fontSize={13} fill={P.red} letterSpacing={2}>
            {copy.labels.zone.toUpperCase()}
          </text>

          {/* forklift, driving slowly to the left */}
          <Forklift x={560 - (frame % 400) * 0.25} y={CAM.h * 0.62} />
          {/* worker, walking into the zone */}
          <Person x={230 + Math.min(frame, riskAt) * 0.9} y={CAM.h * 0.58} bob={Math.sin(frame / 3) * 2} />

          {/* detections */}
          <Box at={boxAt[0]} frame={frame} x={560 - (frame % 400) * 0.25 - 20} y={CAM.h * 0.62 - 92} w={190} h={112} color={P.cyan} label={`${copy.labels.forklift} 0.94`} />
          <Box
            at={boxAt[1]}
            frame={frame}
            x={230 + Math.min(frame, riskAt) * 0.9 - 32}
            y={CAM.h * 0.58 - 128}
            w={64}
            h={150}
            color={risk ? P.red : P.green}
            label={risk ? `${copy.labels.helmet} 0.91` : `${copy.labels.person} 0.98`}
          />
          <Box at={boxAt[2]} frame={frame} x={230 + Math.min(frame, riskAt) * 0.9 - 18} y={CAM.h * 0.58 - 132} w={36} h={30} color={risk ? P.red : P.cyan} label="" />

          {/* scan line */}
          <rect x={0} y={scan} width={CAM.w} height={60} fill={P.cyan} opacity={0.05} />
          <line x1={0} y1={scan + 60} x2={CAM.w} y2={scan + 60} stroke={P.cyan} strokeOpacity={0.35} />
        </svg>

        {/* HUD */}
        <div style={{ position: "absolute", left: 18, top: 14, display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 16, color: P.fg, letterSpacing: 2 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: P.red, opacity: blink ? 1 : 0.2 }} />
          {copy.rec}
          <span style={{ color: P.muted, marginLeft: 10 }}>{copy.cam}</span>
        </div>
        <div style={{ position: "absolute", right: 18, top: 14, fontFamily: MONO, fontSize: 16, color: P.muted, letterSpacing: 1 }}>
          {`${String(Math.floor(frame / 1800)).padStart(2, "0")}:${String(Math.floor(frame / 30) % 60).padStart(2, "0")}:${String(frame % 30).padStart(2, "0")}`}
        </div>
        {[
          [18, 18, "0 0 0 2px", 0],
          [CAM.w - 48, 18, "", 90],
          [CAM.w - 48, CAM.h - 48, "", 180],
          [18, CAM.h - 48, "", 270],
        ].map(([x, y, , r]) => (
          <div key={`${x}-${y}`} style={{ position: "absolute", left: Number(x), top: Number(y), width: 30, height: 30, borderLeft: `2px solid ${P.fg}55`, borderTop: `2px solid ${P.fg}55`, transform: `rotate(${r}deg)` }} />
        ))}

        {/* alert banner */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "14px 22px",
            background: `${P.red}dd`,
            color: "#fff",
            fontFamily: MONO,
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: 1,
            transform: `translateY(${(1 - alert) * 100}%)`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>⚠</span> {copy.alert}
        </div>
      </div>
      <Hit at={alertAt} color={P.red} strength={0.12} len={14} />

      {/* tech chips under the camera */}
      <div style={{ position: "absolute", left: CAM.x, top: CAM.y + CAM.h + 26, display: "flex", gap: 10, flexWrap: "wrap", width: CAM.w }}>
        {EYESR.tech.map((tk, i) => (
          <Chip key={tk} at={bar(2) + i * 4} color={P.violet}>
            {tk}
          </Chip>
        ))}
      </div>

      {/* award card */}
      <div
        style={{
          position: "absolute",
          left: L.left,
          top: 600,
          width: 820,
          padding: "26px 30px",
          borderRadius: 18,
          background: P.panel,
          border: `1px solid ${P.gold}55`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${P.gold}22`,
          opacity: award,
          transform: `translateY(${(1 - award) * 40}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `${P.gold}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrophyIcon size={36} color={P.gold} />
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: P.gold, letterSpacing: -1 }}>{copy.award} · 2021</div>
            <div style={{ fontFamily: SANS, fontSize: 21, color: P.muted, marginTop: 4 }}>{copy.finalist}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 20, fontFamily: MONO, fontSize: 21, color: P.fg, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NewspaperIcon size={22} color={P.violet} />
            <b style={{ fontSize: 28 }}>{Math.round(interpolate(frame, [awardAt + 10, awardAt + 30], [0, PRESS], clamp))}</b> {copy.mediaMentions}
          </span>
          <span style={{ color: P.muted }}>{copy.atHelm}</span>
        </div>
      </div>
      <Hit at={awardAt} color={P.gold} strength={0.1} len={16} />
    </div>
  );
};

const Person: React.FC<{ x: number; y: number; bob: number }> = ({ x, y, bob }) => (
  <g transform={`translate(${x} ${y + bob})`} fill={P.fg} fillOpacity={0.85}>
    <circle cx={0} cy={-112} r={14} />
    <rect x={-16} y={-96} width={32} height={60} rx={10} />
    <rect x={-14} y={-40} width={11} height={44} rx={5} />
    <rect x={3} y={-40} width={11} height={44} rx={5} />
  </g>
);

const Forklift: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} fill={P.fg} fillOpacity={0.7}>
    <rect x={0} y={-70} width={110} height={56} rx={8} />
    <rect x={20} y={-100} width={50} height={34} rx={6} fillOpacity={0.5} />
    <rect x={110} y={-84} width={8} height={90} rx={2} />
    <rect x={118} y={-4} width={46} height={6} rx={2} />
    <circle cx={24} cy={-8} r={14} fill={P.bg} stroke={P.fg} strokeWidth={5} />
    <circle cx={88} cy={-8} r={14} fill={P.bg} stroke={P.fg} strokeWidth={5} />
  </g>
);

/** Detection box: four corner brackets growing in, then a label tag. */
const Box: React.FC<{ at: number; frame: number; x: number; y: number; w: number; h: number; color: string; label: string }> = ({ at, frame, x, y, w, h, color, label }) => {
  if (frame < at) return null;
  const s = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const c = 14 * s;
  const sw = 2.5;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} opacity={0.08 * s} />
      <path d={`M ${x} ${y + c} V ${y} H ${x + c}`} stroke={color} strokeWidth={sw} fill="none" />
      <path d={`M ${x + w - c} ${y} H ${x + w} V ${y + c}`} stroke={color} strokeWidth={sw} fill="none" />
      <path d={`M ${x + w} ${y + h - c} V ${y + h} H ${x + w - c}`} stroke={color} strokeWidth={sw} fill="none" />
      <path d={`M ${x + c} ${y + h} H ${x} V ${y + h - c}`} stroke={color} strokeWidth={sw} fill="none" />
      <rect x={x} y={y} width={w} height={h} stroke={color} strokeOpacity={0.5 * s} fill="none" strokeWidth={1} />
      {label && (
        <g opacity={interpolate(frame, [at + 6, at + 12], [0, 1], clamp)}>
          <rect x={x} y={y - 24} width={label.length * 8.6 + 14} height={22} rx={3} fill={color} />
          <text x={x + 7} y={y - 8} fontFamily={MONO} fontSize={13} fontWeight={700} fill={P.bg}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};
