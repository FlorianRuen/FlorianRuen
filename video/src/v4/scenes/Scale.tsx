import { interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { formatDate, type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, L, P } from "../theme";
import { Caption, Chapter, Chip, Figure, Hit, rise, Words } from "../ui";

const CID = D.work.find((w) => w.company === "CIDgravity");
if (!CID) throw new Error("CIDgravity entry missing");
const ROLE = CID.roles[0];
const TX = D.highlights.find((h) => h.label.en.includes("transactions"));
const PB = D.highlights.find((h) => h.label.en.includes("decentralised"));
if (!TX || !PB) throw new Error("CIDgravity highlights missing");

/** A deterministic set of storage-provider nodes on a globe-ish disc. */
const NODES = Array.from({ length: 34 }, (_, i) => {
  const a = random(`na${i}`) * Math.PI * 2;
  const r = 80 + Math.sqrt(random(`nr${i}`)) * 250;
  return { x: Math.cos(a) * r * 1.15, y: Math.sin(a) * r * 0.78, delay: Math.floor(random(`nd${i}`) * 60), size: 3 + random(`ns${i}`) * 4 };
});
/** Replication links: hub → node, drawn one per few frames. */
const LINKS = NODES.map((n, i) => ({ to: n, at: beat(2) + i * 3 }));
const CX = 1450;
const CY = 520;

/**
 * Bars 8-12: scale. A hub replicates files to dozens of providers (the network
 * draws itself, packets fly on every beat), the two big figures count up.
 */
export const Scale: React.FC<{ copy: Copy4; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const net = rise(frame, 10, 30);
  const rot = frame * 0.0025;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Hit at={0} strength={0.3} />
      <Chapter index={2} label={copy.chapters.scale} meta={`${formatDate(ROLE.start, lang)} → ${formatDate(ROLE.end, lang)}`} accent={P.cyan} />

      <div style={{ position: "absolute", left: L.left, top: 150, width: 860 }}>
        <Words text={copy.scaleTitle[0]} at={14} size={70} />
        <Words text={copy.scaleTitle[1]} at={30} size={70} gradient={`linear-gradient(90deg, ${P.cyan}, ${P.blue})`} />
        <Caption at={beat(3)} size={28} style={{ marginTop: 24, maxWidth: 780 }}>
          {copy.scaleSub}
        </Caption>
      </div>

      {/* figures, on bars 2 and 2.5 */}
      <div style={{ position: "absolute", left: L.left, top: 560, display: "flex", gap: 70 }}>
        <Figure value={t(TX.value, lang)} label={copy.transactions} at={bar(1.5)} color={P.cyan} size={136} />
        <Figure value={t(PB.value, lang)} label={copy.stored} at={bar(2)} color={P.fg} size={136} />
      </div>
      <Hit at={bar(1.5)} color={P.cyan} strength={0.08} />

      <div style={{ position: "absolute", left: L.left, top: 870, display: "flex", gap: 10 }}>
        {CID.tech.map((tk, i) => (
          <Chip key={tk} at={bar(2.5) + i * 3} color={P.cyan}>
            {tk}
          </Chip>
        ))}
      </div>

      {/* network */}
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: net }}>
        <defs>
          <radialGradient id="hub">
            <stop offset="0" stopColor={P.cyan} stopOpacity={0.9} />
            <stop offset="1" stopColor={P.cyan} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* disc rings */}
        <g transform={`translate(${CX} ${CY})`} fill="none" stroke={P.cyan} strokeOpacity={0.12}>
          {[1, 2, 3].map((k) => (
            <ellipse key={k} rx={115 * k} ry={75 * k} />
          ))}
          <ellipse rx={370} ry={235} strokeDasharray="3 10" transform={`rotate(${rot * 400})`} />
        </g>
        {/* links */}
        <g transform={`translate(${CX} ${CY})`}>
          {LINKS.map(({ to, at }, i) => {
            const p = interpolate(frame, [at, at + 14], [0, 1], clamp);
            if (p <= 0) return null;
            const x = to.x * Math.cos(rot) - to.y * Math.sin(rot);
            const y = to.x * Math.sin(rot) + to.y * Math.cos(rot);
            // packet: one per beat along this link, offset per node
            const q = ((frame + i * 7) % beat(1)) / beat(1);
            const show = frame >= at + 14;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static nodes
              <g key={i}>
                <line x1={0} y1={0} x2={x * p} y2={y * p} stroke={P.cyan} strokeOpacity={0.25} strokeWidth={1.2} />
                {show && <circle cx={x * q} cy={y * q} r={3} fill={P.fg} opacity={1 - q * 0.7} />}
                <circle cx={x} cy={y} r={to.size * p} fill={P.bg} stroke={P.cyan} strokeWidth={2} />
                {show && <circle cx={x} cy={y} r={to.size + 6 + Math.sin((frame + i * 5) / 6) * 2} fill="none" stroke={P.cyan} strokeOpacity={0.3} />}
              </g>
            );
          })}
          {/* hub */}
          <circle r={70 + Math.sin(frame / 8) * 4} fill="url(#hub)" opacity={0.6} />
          <circle r={26} fill={P.bg} stroke={P.fg} strokeWidth={3} />
          <circle r={12} fill={P.cyan} />
        </g>
      </svg>

      {/* replicating label under the hub */}
      <div style={{ position: "absolute", left: CX - 200, top: CY + 290, width: 400, textAlign: "center", fontFamily: MONO, fontSize: 20, color: P.cyan, letterSpacing: 3, opacity: rise(frame, beat(3), 12) }}>
        ● {copy.replicating.toUpperCase()} · {Math.min(NODES.length, LINKS.filter((l) => frame >= l.at + 14).length)}/{NODES.length}
      </div>
    </div>
  );
};
