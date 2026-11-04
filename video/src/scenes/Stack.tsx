import { SparklesIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, Flash, Kicker, popAt, SceneShell } from "../components";
import type { Copy } from "../copy";
import { BAR, C, MONO, SANS, SCENES } from "../theme";

/** Every technical skill category (soft skills have their own scene). */
const CATEGORIES = D.skills.slice(1);
const AI = D.skills.find((s) => s.category.en === "AI");

/** 46-54 s: skill categories as columns, tiles raining in; AI gets the spotlight. */
export const Stack: React.FC<{ copy: Copy; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  let n = 0;
  const aiLine = interpolate(frame, [2.5 * BAR, 2.5 * BAR + 10], [0, 1], clamp);

  return (
    <SceneShell duration={SCENES.stack.duration}>
      <Flash />
      <div style={{ position: "absolute", left: 130, top: 110 }}>
        <Kicker>{copy.stackKicker}</Kicker>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 200,
          display: "flex",
          gap: 22,
        }}
      >
        {CATEGORIES.map((cat, ci) => {
          const isAI = cat === AI;
          const head = popAt(frame, ci * 4, 10);
          return (
            <div key={cat.category.en} style={{ flex: isAI ? 1.25 : 1 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: isAI ? C.violet : C.cyan,
                  marginBottom: 18,
                  opacity: Math.min(1, head),
                  whiteSpace: "nowrap",
                }}
              >
                {t(cat.category, lang)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cat.items.map((item) => {
                  const at = 8 + n++ * 2;
                  const s = popAt(frame, at, 10);
                  const label = t(item, lang);
                  return (
                    <div
                      key={label}
                      style={{
                        fontFamily: SANS,
                        fontWeight: 700,
                        fontSize: 28,
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: `1px solid ${isAI ? `${C.violet}88` : C.border}`,
                        background: isAI
                          ? "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(37,99,235,0.15))"
                          : "rgba(255,255,255,0.05)",
                        color: C.fg,
                        opacity: Math.min(1, Math.max(0, s)),
                        transform: `translateY(${(1 - s) * -160}px)`,
                        boxShadow: isAI ? `0 0 24px ${C.violet}55` : "none",
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 110,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 44,
          color: C.fg,
          opacity: aiLine,
          transform: `translateY(${(1 - aiLine) * 30}px)`,
        }}
      >
        <SparklesIcon size={44} color={C.violet} />
        {copy.aiLine}
      </div>
    </SceneShell>
  );
};
