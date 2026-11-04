import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, Flash, GradientText, Kicker, popAt, SceneShell } from "../components";
import type { Copy } from "../copy";
import { BAR, C, MONO, SANS, SCENES } from "../theme";

/** Splits "~1M" / "5 years" / "8+" into prefix, number, suffix for the counter. */
function parse(value: string) {
  const m = value.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return { prefix: "", n: 0, suffix: value };
  return { prefix: m[1], n: Number(m[2].replace(",", ".")), suffix: m[3] };
}

/** v1 keeps its original three cards: years building, requests/day, founder years. */
const FIGURES = ["8+", "~1M", "5 years"].map((v) => {
  const h = D.highlights.find((x) => x.value.en === v);
  if (!h) throw new Error(`v1 figure ${v} missing from resume data`);
  return h;
});

/** 14-22 s: the three highlight numbers count up, one per bar. */
export const Numbers: React.FC<{ copy: Copy; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell duration={SCENES.numbers.duration}>
      <Flash strength={0.35} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 130px",
          display: "flex",
          flexDirection: "column",
          gap: 70,
        }}
      >
        <Kicker>{copy.numbersKicker}</Kicker>
        <div style={{ display: "flex", gap: 40 }}>
          {FIGURES.map((h, i) => {
            const at = 10 + i * (BAR / 2);
            const s = popAt(frame, at, 12);
            const { prefix, n, suffix } = parse(t(h.value, lang));
            const count = interpolate(frame, [at, at + 28], [0, n], clamp);
            const glow = interpolate(frame, [at + 26, at + 34, at + 50], [0, 1, 0.35], clamp);
            return (
              <div
                key={h.label.en}
                style={{
                  flex: 1,
                  padding: "56px 48px",
                  borderRadius: 28,
                  border: `1px solid ${C.border}`,
                  background: "linear-gradient(160deg, rgba(37,99,235,0.18), rgba(10,12,22,0.75))",
                  boxShadow: `0 0 ${60 * glow}px ${C.blue}aa, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  opacity: Math.min(1, s),
                  transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * (i - 1) * 6}deg)`,
                }}
              >
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 900,
                    fontSize: 170,
                    lineHeight: 1,
                    letterSpacing: -6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <GradientText>
                    {prefix}
                    {Math.round(count)}
                    {suffix}
                  </GradientText>
                </div>
                <div
                  style={{
                    marginTop: 26,
                    fontFamily: SANS,
                    fontSize: 36,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    color: C.fg,
                    opacity: interpolate(frame, [at + 10, at + 20], [0, 0.85], clamp),
                  }}
                >
                  {t(h.label, lang)}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 30,
            color: C.muted,
            opacity: interpolate(frame, [130, 150], [0, 1], clamp),
          }}
        >
          <span style={{ color: C.green }}>$</span> git log --oneline | wc -l{" "}
          <span style={{ color: C.fg }}>→ {copy.shipping}</span>
        </div>
      </div>
    </SceneShell>
  );
};
