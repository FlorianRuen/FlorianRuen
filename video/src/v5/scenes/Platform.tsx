import { BrainCircuitIcon, GitBranchIcon, UsersIcon } from "lucide-react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, P } from "../theme";
import { Big, Chip, Flash, kick, months, pop, rise, Slam, Tag } from "../fx";

const OVH = D.work.find((w) => w.company === "OVHcloud");
if (!OVH) throw new Error("OVHcloud entry missing");
const LEAD = OVH.roles[0];
const ENG = OVH.roles[OVH.roles.length - 1];
const REQ = D.highlights.find((h) => h.label.en.includes("requests"));
if (!REQ) throw new Error("requests highlight missing");
const MONTHS = months(ENG.start, LEAD.start);
const ICONS = [GitBranchIcon, UsersIcon, BrainCircuitIcon];

/** Lanes of the request highway (perspective, vanishing at the centre). */
const LANES = 9;
const PROMO_AT = bar(2.5);

/**
 * Bars 12-16. A highway of requests rushing towards the camera, lanes
 * converging on a vanishing point, one burst per beat. ~1M full screen on
 * bar 1, the title on bar 0, the promotion on bar 2.5 with the chord
 * change, the stack on bar 3.
 */
export const Platform: React.FC<{ copy: Copy5; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const k = kick(frame);
  const promo = pop(frame, PROMO_AT, 10);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="pfGlow">
            <stop offset="0" stopColor={P.blue} stopOpacity={0.5 + k * 0.3} />
            <stop offset="1" stopColor={P.blue} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={960} cy={520} r={500} fill="url(#pfGlow)" />
        {/* lanes */}
        {Array.from({ length: LANES }).map((_, i) => {
          const a = (i / (LANES - 1) - 0.5) * Math.PI * 1.3 + Math.PI / 2;
          const x2 = 960 + Math.cos(a) * 1800;
          const y2 = 520 + Math.sin(a) * 1800;
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          return <line key={i} x1={960} y1={520} x2={x2} y2={y2} stroke={P.fg} strokeOpacity={0.08} strokeWidth={2} />;
        })}
        {/* request packets racing outward (towards the camera) */}
        {Array.from({ length: 120 }).map((_, i) => {
          const lane = i % LANES;
          const a = (lane / (LANES - 1) - 0.5) * Math.PI * 1.3 + Math.PI / 2;
          const speed = 0.012 + random(`ps${i}`) * 0.01;
          const p = ((frame * speed + random(`po${i}`)) % 1) ** 2.2;
          const r = p * 1900;
          const x = 960 + Math.cos(a) * r;
          const y = 520 + Math.sin(a) * r;
          const len = 10 + p * 160;
          const ok = random(`pk${i}`) > 0.08;
          return (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: decorative
              key={i}
              x1={x}
              y1={y}
              x2={960 + Math.cos(a) * (r + len)}
              y2={520 + Math.sin(a) * (r + len)}
              stroke={ok ? (lane % 2 ? P.cyan : P.blue) : P.amber}
              strokeOpacity={Math.min(1, p * 2)}
              strokeWidth={2 + p * 6}
              strokeLinecap="round"
            />
          );
        })}
        {/* the API, at the vanishing point */}
        <circle cx={960} cy={520} r={60 + k * 14} fill={P.bg} stroke={P.fg} strokeWidth={4} />
        <circle cx={960} cy={520} r={26 + k * 8} fill={P.blue} />
        <text x={960} y={620} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={P.fg} letterSpacing={6} opacity={0.9}>
          API
        </text>
      </svg>

      <div style={{ position: "absolute", inset: 0, background: P.bg, opacity: frame >= PROMO_AT ? Math.min(0.6, promo * 0.6) : 0, pointerEvents: "none" }} />
      <Tag n={3} label={copy.ch.platform} accent={P.blue} />

      {/* bar 0: title */}
      <div style={{ position: "absolute", left: 120, top: 200, width: 1700 }}>
        <Slam text={copy.platformTitle[0]} at={2} until={bar(1)} size={100} stagger={3} />
        <Slam text={copy.platformTitle[1]} at={beat(1.5)} until={bar(1)} size={100} gradient={`linear-gradient(90deg, ${P.blue}, ${P.cyan})`} stagger={3} />
      </div>
      {/* bar 1-2.5: ~1M full screen */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Big value={t(REQ.value, lang)} label={copy.reqPerDay} at={bar(1)} until={PROMO_AT} color={P.fg} size={440} align="center" />
      </div>
      <Flash at={bar(1)} color={P.blue} strength={0.45} />

      {/* bar 2.5: promotion */}
      {frame >= PROMO_AT && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: Math.min(1, promo), transform: `scale(${promo})` }}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: P.green, letterSpacing: 4, fontWeight: 700 }}>↑ {copy.after(MONTHS).toUpperCase()}</div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 112, letterSpacing: -5, color: P.fg, marginTop: 10, textAlign: "center", lineHeight: 1 }}>{copy.promoted}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
            {copy.leads.map((l, i) => {
              const Icon = ICONS[i];
              return (
                <Chip key={l} at={PROMO_AT + beat(1) + i * 4} color={P.green} big>
                  <Icon size={28} color={P.green} /> {l}
                </Chip>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500 }}>
            {OVH.tech.map((tk, i) => (
              <Chip key={tk} at={bar(3) + beat(1) + i * 2} color={P.blue}>
                {tk}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <Flash at={PROMO_AT} color={P.green} strength={0.4} />
      <div style={{ position: "absolute", right: 120, bottom: 100, fontFamily: MONO, fontSize: 24, color: P.blue, letterSpacing: 4, opacity: 0.9 * rise(frame, 4, 8) }}>
        ● {Math.round(interpolate(frame, [0, bar(1)], [0, 99.98], clamp) * 100) / 100}% UPTIME · {Math.round(680 + Math.sin(frame / 4) * 60 + k * 90)} req/s
      </div>
    </div>
  );
};
