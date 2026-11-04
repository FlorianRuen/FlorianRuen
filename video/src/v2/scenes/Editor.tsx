import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO } from "../../theme";
import { Code, charCount } from "../code";
import type { Copy2 } from "../copy";
import { bar, K } from "../theme";

/** Bars 0-4: florian.go types itself, then `go run` starts the show. */
export function goSource(copy: Copy2, lang: Lang) {
  const q = (s: string) => `"${s}"`;
  const role = t(D.work[0].roles[0].title, lang);
  const company = D.work[0].company;
  return [
    copy.goHeader,
    "package main",
    "",
    "var florian = Engineer{",
    `\tName:     ${q(D.name)},`,
    `\tRole:     ${q(`${role} @ ${company}`)},`,
    `\tLocation: ${q(t(D.location, lang))},`,
    `\tYears:    8, ${copy.goCounting}`,
    `\tStack:    []string{"Go", "Kubernetes", "TypeScript", "React"},`,
    `\tExploring: []string{"LLMs", "AI-assisted dev"},`,
    "}",
    "",
    "func main() {",
    `\tflorian.Ship() ${copy.goTodo}`,
    "}",
  ].map((l) => l.replace(/\t/g, "    "));
}

export const Editor: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const lines = goSource(copy, lang);
  const total = charCount(lines);
  // Typing runs from the end of the fly-in to the start of bar 3.
  const chars = interpolate(frame, [bar(0.6), bar(3)], [0, total], clamp);
  const runAt = bar(3.1);
  const term = interpolate(frame, [runAt, runAt + 8], [0, 1], clamp);
  const progress = interpolate(frame, [runAt + 10, bar(4) - 4], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ padding: "26px 0" }}>
        <Code lines={lines} lang="go" chars={chars} frame={frame} fontSize={27} />
      </div>
      {/* integrated terminal */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 170 * term,
          overflow: "hidden",
          background: K.chrome,
          borderTop: `1px solid ${K.border}`,
          fontFamily: MONO,
          fontSize: 24,
          padding: term > 0 ? "18px 30px" : 0,
        }}
      >
        <div style={{ color: K.dim, fontSize: 15, letterSpacing: 2, marginBottom: 10 }}>TERMINAL</div>
        <div>
          <span style={{ color: K.green }}>➜ </span>
          <span style={{ color: K.cyan }}>florian-ruen </span>
          <span style={{ color: K.fg }}>go run ./cmd/florian</span>
        </div>
        <div style={{ color: K.dim, marginTop: 6, display: "flex", alignItems: "center", gap: 20 }}>
          {copy.goRun}
          <div style={{ width: 520, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${K.cyan}, ${K.blue}, ${K.violet})`,
                boxShadow: `0 0 18px ${K.cyan}`,
              }}
            />
          </div>
          <span style={{ color: K.fg }}>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
