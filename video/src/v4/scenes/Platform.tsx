import { BrainCircuitIcon, GitBranchIcon, UsersIcon } from "lucide-react";
import { random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { formatDate, type Lang, t } from "@/lib/i18n";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, L, P } from "../theme";
import { Caption, Chapter, Chip, Figure, Hit, rise, Words, years } from "../ui";

const OVH = D.work.find((w) => w.company === "OVHcloud");
if (!OVH) throw new Error("OVHcloud entry missing");
const LEAD = OVH.roles[0];
const ENG = OVH.roles[OVH.roles.length - 1];
const REQ = D.highlights.find((h) => h.label.en.includes("requests"));
if (!REQ) throw new Error("requests highlight missing");
const MONTHS = years(ENG.start, LEAD.start);

const SERVICES = ["servers", "network", "vRack", "BGP peering"];
const TEAMS = ["product A", "product B", "product C"];
const LEAD_ICONS = [GitBranchIcon, UsersIcon, BrainCircuitIcon];

/**
 * Bars 12-16: the platform. Product teams on the left, the API in the middle
 * and the cloud services on the right. Requests stream through the API on
 * every beat; the ~1M counts up, then the promotion drops with the chord
 * change on bar 2.5.
 */
export const Platform: React.FC<{ copy: Copy4; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const diagram = rise(frame, 16, 24);
  const promoAt = bar(2.5);
  const promo = rise(frame, promoAt, 14);
  const X = { teams: 1030, api: 1360, svc: 1700 };
  const Y0 = 300;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Hit at={0} strength={0.3} />
      <Chapter index={3} label={copy.chapters.platform} meta={`${formatDate(ENG.start, lang)} → ${formatDate(null, lang).toLowerCase()}`} accent={P.blue} />

      <div style={{ position: "absolute", left: L.left, top: 150, width: 860 }}>
        <Words text={copy.platformTitle[0]} at={14} size={56} />
        <Words text={copy.platformTitle[1]} at={30} size={56} gradient={`linear-gradient(90deg, ${P.blue}, ${P.cyan})`} />
      </div>

      <div style={{ position: "absolute", left: L.left, top: 470 }}>
        <Figure value={t(REQ.value, lang)} label={copy.reqPerDay} at={bar(1.5)} color={P.blue} size={170} />
      </div>
      <Hit at={bar(1.5)} color={P.blue} strength={0.08} />

      <div style={{ position: "absolute", left: L.left, top: 770, display: "flex", gap: 10, flexWrap: "wrap", width: 820 }}>
        {OVH.tech.map((tk, i) => (
          <Chip key={tk} at={bar(2) + i * 3} color={P.blue}>
            {tk}
          </Chip>
        ))}
      </div>

      {/* diagram */}
      <div style={{ position: "absolute", inset: 0, opacity: diagram, transform: `translateX(${(1 - diagram) * 60}px)` }}>
        <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {TEAMS.map((name, i) => {
            const y = Y0 + 60 + i * 120;
            return <path key={name} d={`M ${X.teams + 120} ${y} C ${X.teams + 220} ${y}, ${X.api - 160} ${Y0 + 180}, ${X.api - 90} ${Y0 + 180}`} stroke={P.line} strokeWidth={2} fill="none" />;
          })}
          {SERVICES.map((name, i) => {
            const y = Y0 + 20 + i * 100;
            return <path key={name} d={`M ${X.api + 90} ${Y0 + 180} C ${X.api + 160} ${Y0 + 180}, ${X.svc - 220} ${y}, ${X.svc - 120} ${y}`} stroke={P.line} strokeWidth={2} fill="none" />;
          })}
          {/* request packets */}
          {Array.from({ length: 14 }).map((_, i) => {
            const period = beat(1);
            const start = Math.floor(random(`ps${i}`) * period);
            const tIn = ((frame + start) % (period * 2)) / (period * 2);
            if (frame < beat(2)) return null;
            const team = i % TEAMS.length;
            const svc = Math.floor(random(`pv${i}`) * SERVICES.length);
            const y1 = Y0 + 60 + team * 120;
            const y2 = Y0 + 20 + svc * 100;
            const seg = tIn < 0.5 ? tIn * 2 : (tIn - 0.5) * 2;
            const [x0, y0, x3, y3] = tIn < 0.5 ? [X.teams + 120, y1, X.api - 90, Y0 + 180] : [X.api + 90, Y0 + 180, X.svc - 120, y2];
            const x1 = tIn < 0.5 ? X.teams + 220 : X.api + 160;
            const x2 = tIn < 0.5 ? X.api - 160 : X.svc - 220;
            const u = seg;
            const bx = (1 - u) ** 3 * x0 + 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3 * x3;
            const by = (1 - u) ** 3 * y0 + 3 * (1 - u) ** 2 * u * (tIn < 0.5 ? y1 : Y0 + 180) + 3 * (1 - u) * u * u * (tIn < 0.5 ? Y0 + 180 : y2) + u ** 3 * y3;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static packets
              <circle key={i} cx={bx} cy={by} r={4} fill={tIn < 0.5 ? P.fg : P.cyan} opacity={0.9} />
            );
          })}
        </svg>

        {TEAMS.map((name, i) => (
          <Node key={name} x={X.teams} y={Y0 + 60 + i * 120} w={240} h={70} label={lang === "fr" ? `équipe produit ${"ABC"[i]}` : `product team ${"ABC"[i]}`} color={P.muted} at={20 + i * 4} />
        ))}
        <Node x={X.api} y={Y0 + 180} w={180} h={180} label={copy.apiLabel} color={P.blue} at={34} big pulse={frame >= beat(2) ? Math.exp(-((frame % beat(1)) / beat(1)) * 5) : 0} />
        {SERVICES.map((name, i) => (
          <Node key={name} x={X.svc} y={Y0 + 20 + i * 100} w={240} h={64} label={name} color={P.cyan} at={44 + i * 4} />
        ))}
      </div>

      {/* promotion card */}
      <div
        style={{
          position: "absolute",
          left: 1010,
          top: 760,
          width: 770,
          padding: "22px 28px",
          borderRadius: 18,
          background: P.panel,
          border: `1px solid ${P.green}55`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${P.green}22`,
          opacity: promo,
          transform: `translateY(${(1 - promo) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 20, color: P.green, letterSpacing: 2 }}>
          ↑ {formatDate(LEAD.start, lang)} · {copy.promoted(MONTHS)}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 16, flexWrap: "wrap" }}>
          {copy.leads.map((l, i) => {
            const Icon = LEAD_ICONS[i];
            return (
              <Caption key={l} at={promoAt + 8 + i * 5} color={P.fg} size={20} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={22} color={P.green} /> {l}
              </Caption>
            );
          })}
        </div>
      </div>
      <Hit at={promoAt} color={P.green} strength={0.1} />
    </div>
  );
};

const Node: React.FC<{ x: number; y: number; w: number; h: number; label: string; color: string; at: number; big?: boolean; pulse?: number }> = ({ x, y, w, h, label, color, at, big, pulse = 0 }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, at, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: big ? 28 : 12,
        background: big ? `${color}22` : P.panel,
        border: `${big ? 2 : 1}px solid ${color}${big ? "" : "77"}`,
        boxShadow: big ? `0 0 ${40 + pulse * 50}px ${color}66` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: big ? SANS : MONO,
        fontWeight: big ? 800 : 400,
        fontSize: big ? 30 : 19,
        color: big ? P.fg : color,
        opacity: s,
        transform: `scale(${0.85 + s * 0.15 + pulse * 0.03})`,
        textAlign: "center",
        letterSpacing: big ? -0.5 : 0,
      }}
    >
      {label}
    </div>
  );
};
