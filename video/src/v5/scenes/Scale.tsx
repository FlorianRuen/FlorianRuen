import { interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, P } from "../theme";
import { Big, Chip, Flash, kick, rise, Slam, Tag } from "../fx";

const CID = D.work.find((w) => w.company === "CIDgravity");
if (!CID) throw new Error("CIDgravity entry missing");
const TX = D.highlights.find((h) => h.label.en.includes("transactions"));
const PB = D.highlights.find((h) => h.label.en.includes("decentralised"));
if (!TX || !PB) throw new Error("CIDgravity highlights missing");

/** Provider nodes in a 3D cloud the camera flies through. */
const NODES = Array.from({ length: 90 }, (_, i) => ({
  x: (random(`nx${i}`) - 0.5) * 3000,
  y: (random(`ny${i}`) - 0.5) * 1700,
  z: random(`nz${i}`) * 4000,
  size: 4 + random(`ns${i}`) * 8,
}));
const FOCAL = 900;

/**
 * Bars 8-12. The camera flies forward through a cloud of storage providers,
 * replication packets racing between them on every beat. ~58M slams on bar
 * 1, ~9.3 PB on bar 2, both full screen; the title and stack on bar 3.
 */
export const Scale: React.FC<{ copy: Copy5; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const camZ = frame * 14;
  const k = kick(frame);
  const nodes = NODES.map((n) => {
    const z = ((n.z - camZ) % 4000 + 4000) % 4000 + 150;
    const s = FOCAL / z;
    return { x: 960 + n.x * s, y: 540 + n.y * s, r: n.size * s * 2.2, z, s };
  }).sort((a, b) => b.z - a.z);
  const near = nodes.filter((n) => n.z < 2200);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 960 - 700, top: 540 - 700, width: 1400, height: 1400, background: `radial-gradient(circle, ${P.cyan}${Math.round(25 + k * 40).toString(16).padStart(2, "0")}, transparent 55%)` }} />
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* links between near nodes, packets racing on the beat */}
        {near.slice(0, 40).map((a, i) => {
          const b = near[(i * 7 + 3) % near.length];
          if (!b || a === b) return null;
          const q = ((frame + i * 5) % beat(1)) / beat(1);
          const o = Math.min(1, (2200 - a.z) / 1200) * Math.min(1, (2200 - b.z) / 1200);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional
            <g key={i} opacity={o}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={P.cyan} strokeOpacity={0.18} strokeWidth={1.5} />
              <circle cx={a.x + (b.x - a.x) * q} cy={a.y + (b.y - a.y) * q} r={4} fill={P.fg} />
            </g>
          );
        })}
        {nodes.map((n, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional
          <g key={i} opacity={Math.min(1, (4150 - n.z) / 1500)}>
            <circle cx={n.x} cy={n.y} r={n.r * (1 + k * 0.3)} fill={P.cyan} opacity={0.18} />
            <circle cx={n.x} cy={n.y} r={Math.max(1.5, n.r * 0.4)} fill={P.fg} />
          </g>
        ))}
      </svg>

      <Tag n={2} label={copy.ch.scale} accent={P.cyan} />

      {/* bar 0: the role */}
      <div style={{ position: "absolute", left: 120, top: 320, width: 1700 }}>
        <Slam text={copy.scaleTitle[0]} at={2} until={bar(1)} size={120} stagger={3} />
        <Slam text={copy.scaleTitle[1]} at={beat(1.5)} until={bar(1)} size={92} gradient={`linear-gradient(90deg, ${P.cyan}, ${P.blue})`} stagger={3} />
      </div>
      {/* bar 1: ~58M, bar 2: ~9.3 PB, full screen */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Big value={t(TX.value, lang)} label={copy.transactions} at={bar(1)} until={bar(2)} color={P.cyan} size={380} align="center" />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Big value={t(PB.value, lang)} label={copy.stored} at={bar(2)} until={bar(3)} color={P.fg} size={380} align="center" />
      </div>
      <Flash at={bar(1)} color={P.cyan} strength={0.4} />
      <Flash at={bar(2)} strength={0.4} />
      {/* bar 3: the sentence + the stack */}
      <div style={{ position: "absolute", left: 120, top: 330, width: 1700 }}>
        <Slam text={copy.scaleSub} at={bar(3)} size={72} weight={700} stagger={2} style={{ whiteSpace: "normal" }} />
        <div style={{ display: "flex", gap: 14, marginTop: 40, flexWrap: "wrap" }}>
          {CID.tech.map((tk, i) => (
            <Chip key={tk} at={bar(3) + beat(1) + i * 3} color={P.cyan} big>
              {tk}
            </Chip>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 100, fontFamily: MONO, fontSize: 24, color: P.cyan, letterSpacing: 4, opacity: rise(frame, beat(2), 8) * 0.9 }}>
        ● {Math.round(interpolate(frame, [0, bar(4)], [0, 100], clamp))}% · {Math.min(NODES.length, Math.floor(frame / 2))}/{NODES.length} PROVIDERS
      </div>
    </div>
  );
};
