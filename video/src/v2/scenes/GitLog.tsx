import { TrophyIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy2 } from "../copy";
import { beat, K } from "../theme";

type Commit = {
  date: string;
  msg: string;
  ref?: string;
  tag?: string;
  lane: 0 | 1;
  /** Merge/branch commits draw the curve between lanes. */
  kind?: "branch" | "merge";
  color: string;
};

/** The career as `git log --graph`, oldest at the bottom like the real thing. */
function commits(lang: Lang): Commit[] {
  const job = (name: string) => {
    const j = D.work.find((w) => w.company === name);
    if (!j) throw new Error(`unknown company ${name}`);
    return j;
  };
  const ovh = job("OVHcloud");
  const ovhLead = ovh.roles[0];
  const ovhEng = ovh.roles[ovh.roles.length - 1];
  const forvia = job("Forvia Seating");
  const cid = job("CIDgravity");
  const edu = D.education;
  const fr = lang === "fr";
  const list: Commit[] = [
    { date: edu[2].start, msg: `init: ${t(edu[2].degree, lang)}`, lane: 0, color: K.dim },
    { date: edu[1].start, msg: `feat: ${t(edu[1].degree, lang)}`, lane: 0, color: K.dim },
    {
      date: forvia.roles[0].start,
      msg: `feat: ${edu[0].school} + ${t(forvia.roles[0].title, lang)} @ Forvia`,
      lane: 0,
      color: K.cyan,
    },
    { date: "2018", msg: fr ? "branch: créer Eyes'R (IA + vision par ordinateur)" : "branch: found Eyes'R (AI + computer vision)", lane: 1, kind: "branch", color: K.violet, ref: "founder" },
    { date: "2021", msg: fr ? "feat: Prix de l'innovation Préventica" : "feat: win Préventica Innovation Award", lane: 1, color: K.yellow, tag: "award" },
    { date: cid.roles[0].start, msg: `merge: ${t(cid.roles[0].title, lang)} @ CIDgravity (Web3)`, lane: 0, kind: "merge", color: K.cyan },
    { date: ovhEng.start, msg: `feat: ${t(ovhEng.title, lang)} @ OVHcloud`, lane: 0, color: K.cyan },
    {
      date: ovhLead.start,
      msg: fr ? `perf: promu ${t(ovhLead.title, lang)}` : `perf: promoted to ${t(ovhLead.title, lang)}`,
      lane: 0,
      color: K.green,
      ref: "HEAD -> main",
    },
  ];
  return list.reverse();
}

const ROW = 70;
const LANE_X = [40, 92];

/** Bars 4-10: one commit per beat-and-a-half, newest first. */
export const GitLog: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const list = commits(lang);
  const n = list.length;
  // Revealed from the bottom (oldest) to the top (newest).
  const revealAt = (i: number) => beat(1) + (n - 1 - i) * beat(2.2);
  const lastReveal = revealAt(0);
  const detail = popAt(frame, lastReveal + beat(2), 12);

  return (
    <div style={{ position: "absolute", inset: 0, padding: "34px 40px", fontFamily: MONO }}>
      <div style={{ fontSize: 24, marginBottom: 22 }}>
        <span style={{ color: K.green }}>➜ </span>
        <span style={{ color: K.cyan }}>florian-ruen </span>
        <span style={{ color: K.fg }}>git log --graph --oneline --all</span>
      </div>

      <div style={{ position: "relative", height: n * ROW }}>
        {/* graph lines */}
        <svg aria-hidden="true" width={160} height={n * ROW} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {list.map((c, i) => {
            if (i === n - 1) return null;
            const o = interpolate(frame, [revealAt(i), revealAt(i) + 6], [0, 1], clamp);
            const y1 = i * ROW + ROW / 2;
            const y2 = (i + 1) * ROW + ROW / 2;
            const next = list[i + 1];
            const paths: React.ReactNode[] = [];
            // main lane continues everywhere
            paths.push(<line key="m" x1={LANE_X[0]} y1={y1} x2={LANE_X[0]} y2={y2} stroke={K.cyan} strokeWidth={4} opacity={o} />);
            // side lane: from branch (lower) to merge (upper)
            if (c.kind === "merge") {
              paths.push(
                <path key="b" d={`M ${LANE_X[0]} ${y1} C ${LANE_X[1]} ${y1}, ${LANE_X[1]} ${y1 + 20}, ${LANE_X[1]} ${y2}`} stroke={K.violet} strokeWidth={4} fill="none" opacity={o} />,
              );
            } else if (c.lane === 1 && next.kind !== "branch" && next.lane === 1) {
              paths.push(<line key="s" x1={LANE_X[1]} y1={y1} x2={LANE_X[1]} y2={y2} stroke={K.violet} strokeWidth={4} opacity={o} />);
            }
            if (c.kind === "branch") {
              paths.push(
                <path key="br" d={`M ${LANE_X[1]} ${y1} C ${LANE_X[1]} ${y2 - 20}, ${LANE_X[0]} ${y2}, ${LANE_X[0]} ${y2}`} stroke={K.violet} strokeWidth={4} fill="none" opacity={o} />,
              );
            }
            return <g key={c.msg}>{paths}</g>;
          })}
        </svg>

        {list.map((c, i) => {
          const s = popAt(frame, revealAt(i), 9);
          const o = Math.min(1, Math.max(0, s));
          const hash = (0x9f3a1c + i * 0x2b7d5).toString(16).slice(0, 7);
          return (
            <div
              key={c.msg}
              style={{
                position: "absolute",
                top: i * ROW,
                left: 0,
                right: 0,
                height: ROW,
                display: "flex",
                alignItems: "center",
                opacity: o,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: LANE_X[c.lane] - 13,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: K.window,
                  border: `5px solid ${c.color}`,
                  boxShadow: `0 0 ${18 * o}px ${c.color}`,
                  transform: `scale(${s})`,
                }}
              />
              <div style={{ marginLeft: 150, display: "flex", alignItems: "center", gap: 18, fontSize: 25, whiteSpace: "nowrap", transform: `translateX(${(1 - o) * 40}px)` }}>
                <span style={{ color: K.yellow }}>{hash}</span>
                {c.ref && (
                  <span style={{ color: c.ref.startsWith("HEAD") ? K.green : K.violet, fontWeight: 700 }}>
                    ({c.ref})
                  </span>
                )}
                {c.tag && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: K.yellow, fontWeight: 700 }}>
                    <TrophyIcon size={22} /> tag: {c.tag}
                  </span>
                )}
                <span style={{ color: c.color === K.dim ? "#a9b2c8" : K.fg }}>{c.msg}</span>
                <span style={{ color: K.faint }}>· {c.date.slice(0, 4)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* commit detail card for HEAD */}
      <div
        style={{
          position: "absolute",
          left: 190,
          right: 40,
          bottom: 26,
          padding: "22px 28px",
          borderRadius: 14,
          background: K.panel,
          border: `1px solid ${K.border}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${K.green}22`,
          opacity: Math.min(1, Math.max(0, detail)),
          transform: `translateY(${(1 - detail) * 40}px)`,
          fontSize: 20,
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: K.dim, letterSpacing: 2, fontSize: 14, marginBottom: 8 }}>{copy.commitDetails.toUpperCase()}</div>
        <div>
          <span style={{ color: K.dim }}>{copy.author}: </span>
          {D.name} &lt;{D.contact.email}&gt;
        </div>
        <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, marginTop: 10, lineHeight: 1.35 }}>
          {t(D.work[0].roles[0].bullets[0], lang)}
        </div>
      </div>
    </div>
  );
};
