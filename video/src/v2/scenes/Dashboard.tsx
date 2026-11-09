import { TrophyIcon } from "lucide-react";
import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy2 } from "../copy";
import { beat, K } from "../theme";

/** "~9,3 Po" → { prefix: "~", n: 9.3, decimals: 1, sep: ",", suffix: " Po" } */
function parse(value: string) {
  const m = value.match(/^([^\d]*)(\d+)(?:([.,])(\d+))?(.*)$/);
  if (!m) return { prefix: "", n: 0, decimals: 0, sep: ".", suffix: value };
  const decimals = m[4]?.length ?? 0;
  return { prefix: m[1], n: Number(`${m[2]}.${m[4] ?? 0}`), decimals, sep: m[3] ?? ".", suffix: m[5] };
}

const PRODUCT = D.highlights.filter((h) => h.group === "product");
const CAREER = D.highlights.filter((h) => h.group === "career");

const Panel: React.FC<{ title: string; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  title,
  at,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = popAt(frame, at, 10);
  return (
    <div
      style={{
        background: K.panel,
        border: `1px solid ${K.border}`,
        borderRadius: 10,
        padding: "16px 22px",
        display: "flex",
        flexDirection: "column",
        opacity: Math.min(1, Math.max(0, s)),
        transform: `translateY(${(1 - s) * 40}px)`,
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, color: "#b8c0d6", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
};

/** Requests/day: a deterministic, slightly noisy curve that draws itself. */
function seriesPath(w: number, h: number, progress: number) {
  const pts: string[] = [];
  const n = 60;
  for (let i = 0; i <= n * progress; i++) {
    const x = (i / n) * w;
    const daily = Math.sin((i / n) * Math.PI * 6) * 0.18;
    const noise = Math.sin(i * 12.9898) * 0.06;
    const trend = 0.45 + (i / n) * 0.25;
    const y = h - (trend + daily + noise) * h;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Bars 25-30: the career as an observability dashboard. */
export const Dashboard: React.FC<{ copy: Copy2; lang: Lang; showInterests?: boolean }> = ({ copy, lang, showInterests = true }) => {
  const frame = useCurrentFrame();
  const press = D.work.find((w) => "press" in w);
  const pressCount = press && "press" in press ? press.press.items.length : 0;

  // Career level step chart (studies → engineer → founder → head → leader)
  const steps = [
    { y: "2010", v: 0.12 },
    { y: "2015", v: 0.3 },
    { y: "2018", v: 0.7 },
    { y: "2023", v: 0.62 },
    { y: "2024", v: 0.66 },
    { y: "2025", v: 0.85 },
  ];
  const chartP = interpolate(frame, [beat(3), beat(9)], [0, 1], clamp);
  const reqP = interpolate(frame, [beat(2), beat(10)], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", inset: 0, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: 20 }}>
        <span style={{ color: K.fg, fontWeight: 700 }}>▦ {copy.dashTitle}</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: K.dim, border: `1px solid ${K.border}`, padding: "4px 14px", borderRadius: 6 }}>⏱ {copy.timeRange}</span>
        <span style={{ color: K.green }}>● live</span>
      </div>

      {/* stat row */}
      <div style={{ display: "flex", gap: 14 }}>
        {PRODUCT.map((h, i) => {
          const at = beat(1) + i * beat(1);
          const { prefix, n, decimals, sep, suffix } = parse(t(h.value, lang));
          const v = interpolate(frame, [at, at + 24], [0, n], clamp).toFixed(decimals).replace(".", sep);
          const color = [K.cyan, K.green, K.violet][i];
          return (
            <Panel key={h.label.en} title={t(h.label, lang)} at={at} style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1, color, letterSpacing: -3 }}>
                {prefix}
                {v}
                {suffix}
              </div>
              {i === 0 && (
                <svg aria-hidden="true" width="100%" height={46} viewBox="0 0 400 46" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                  <path d={seriesPath(400, 46, reqP)} stroke={K.green} strokeWidth={2.5} fill="none" />
                </svg>
              )}
            </Panel>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>
        {/* career chart */}
        <Panel title={copy.careerPanel} at={beat(3)} style={{ flex: 1.35 }}>
          <div style={{ display: "flex", gap: 28, marginBottom: 6 }}>
            {CAREER.map((h, i) => (
              <div key={h.label.en} style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0, opacity: interpolate(frame, [beat(3.5) + i * 4, beat(3.5) + i * 4 + 8], [0, 1], clamp) }}>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: K.cyan, whiteSpace: "nowrap" }}>{t(h.value, lang)}</span>
                <span style={{ fontFamily: SANS, fontSize: 15, color: K.dim, lineHeight: 1.2 }}>{t(h.label, lang).split(":")[0]}</span>
              </div>
            ))}
          </div>
          <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 700 300" preserveAspectRatio="none" style={{ flex: 1 }}>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={0} x2={700} y1={300 * g} y2={300 * g} stroke={K.border} strokeDasharray="4 6" />
            ))}
            {(() => {
              const pts = steps.map((s, i) => [(i / (steps.length - 1)) * 680 + 10, 290 - s.v * 270] as const);
              const visible = Math.max(1, Math.ceil(chartP * pts.length));
              let d = `M ${pts[0][0]} ${pts[0][1]}`;
              for (let i = 1; i < visible; i++) d += ` H ${pts[i][0]} V ${pts[i][1]}`;
              return (
                <>
                  <path d={`${d} V 300 H ${pts[0][0]} Z`} fill="url(#g)" opacity={0.35} />
                  <path d={d} stroke={K.cyan} strokeWidth={4} fill="none" />
                  {pts.slice(0, visible).map(([x, y], i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static points
                    <circle key={i} cx={x} cy={y} r={7} fill={K.window} stroke={K.cyan} strokeWidth={3} />
                  ))}
                </>
              );
            })()}
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={K.cyan} />
                <stop offset="1" stopColor={K.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 16, color: K.dim }}>
            {steps.map((s) => (
              <span key={s.y}>{s.y}</span>
            ))}
          </div>
        </Panel>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Panel title={copy.awardsPanel} at={beat(5)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 28, color: K.yellow }}>
              <TrophyIcon size={34} /> Préventica 2021
            </div>
            <div style={{ fontFamily: SANS, fontSize: 18, color: K.dim, marginTop: 4 }}>{copy.finalist}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: K.fg }}>
                {Math.round(interpolate(frame, [beat(6), beat(8)], [0, pressCount], clamp))}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 18, color: K.dim }}>{copy.mediaMentions}</span>
            </div>
          </Panel>
          <Panel title={copy.projectsPanel} at={beat(7)}>
            {D.projects.map((p, i) => (
              <div key={p.title} style={{ display: "flex", gap: 10, fontFamily: SANS, fontSize: 19, lineHeight: 1.45, opacity: interpolate(frame, [beat(7) + i * 4, beat(7) + i * 4 + 8], [0, 1], clamp) }}>
                <span style={{ color: K.green }}>●</span>
                <span style={{ color: K.fg, fontWeight: 700 }}>{p.title}</span>
                <span style={{ color: K.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(p.tags[0], lang)}</span>
              </div>
            ))}
          </Panel>
          {showInterests && (
          <Panel title={copy.interestsPanel} at={beat(9)}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {D.interests.map((i) => (
                <span key={i.en} style={{ fontFamily: MONO, fontSize: 17, padding: "4px 12px", borderRadius: 6, background: "rgba(168,85,247,0.15)", border: `1px solid ${K.violet}66`, color: K.fg }}>
                  {t(i, lang)}
                </span>
              ))}
            </div>
          </Panel>
          )}
        </div>
      </div>
    </div>
  );
};
