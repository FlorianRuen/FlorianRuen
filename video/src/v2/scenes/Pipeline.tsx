import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy2 } from "../copy";
import { bar, K } from "../theme";

/** Technical skill categories become pipeline stages (soft skills are pods later). */
const STAGES = D.skills.slice(1);
const STAGE_LEN = bar(1);
const STAGE_START = bar(0.75);

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Bars 10-18: `git push` triggers the pipeline; each stage runs for one bar. */
export const Pipeline: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const totalTests = STAGES.reduce((n, s) => n + s.items.length, 0);
  const doneAt = STAGE_START + STAGES.length * STAGE_LEN;
  const banner = popAt(frame, doneAt, 12);
  const current = Math.min(STAGES.length - 1, Math.max(0, Math.floor((frame - STAGE_START) / STAGE_LEN)));
  const stage = STAGES[current];
  const local = frame - STAGE_START - current * STAGE_LEN;
  const isAI = stage.category.en === "AI";

  return (
    <div style={{ position: "absolute", inset: 0, padding: "30px 44px", fontFamily: MONO }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>{copy.pipelineTitle} #2026</span>
        <span style={{ color: K.dim, fontSize: 21 }}>{copy.triggered}</span>
      </div>

      {/* stage graph */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 34, marginBottom: 34 }}>
        {STAGES.map((s, i) => {
          const st = frame >= STAGE_START + (i + 1) * STAGE_LEN ? "done" : i === current && frame >= STAGE_START ? "run" : "wait";
          const color = st === "done" ? K.green : st === "run" ? K.cyan : K.faint;
          const appear = popAt(frame, i * 3, 8);
          return (
            <div key={s.category.en} style={{ display: "flex", alignItems: "center", flex: i < STAGES.length - 1 ? 1 : 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: `2px solid ${color}`,
                  background: st === "run" ? "rgba(34,211,238,0.12)" : st === "done" ? "rgba(74,222,128,0.08)" : "transparent",
                  boxShadow: st === "run" ? `0 0 26px ${K.cyan}66` : "none",
                  color: st === "wait" ? K.dim : K.fg,
                  fontSize: 19,
                  whiteSpace: "nowrap",
                  transform: `scale(${appear})`,
                  opacity: Math.min(1, Math.max(0, appear)),
                }}
              >
                {st === "done" ? (
                  <CheckIcon size={20} color={K.green} strokeWidth={3} />
                ) : st === "run" ? (
                  <LoaderCircleIcon size={20} color={K.cyan} style={{ transform: `rotate(${frame * 12}deg)` }} />
                ) : (
                  <div style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${K.faint}` }} />
                )}
                {slug(t(s.category, "en"))}
              </div>
              {i < STAGES.length - 1 && (
                <div style={{ flex: 1, height: 3, margin: "0 6px", background: K.border, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${interpolate(frame, [STAGE_START + (i + 1) * STAGE_LEN - 6, STAGE_START + (i + 1) * STAGE_LEN + 4], [0, 100], clamp)}%`,
                      background: K.green,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* job log of the running stage */}
      <div
        style={{
          height: 560,
          borderRadius: 14,
          background: K.chrome,
          border: `1px solid ${K.border}`,
          padding: "22px 30px",
          fontSize: 25,
          lineHeight: "44px",
          opacity: banner > 0.9 ? 0.25 : 1,
        }}
      >
        {frame >= STAGE_START && (
          <>
            <div style={{ color: K.dim }}>
              $ run-tests --suite={slug(t(stage.category, "en"))}{" "}
              <span style={{ color: K.faint }}>({t(stage.category, lang)})</span>
            </div>
            {stage.items.map((item, j) => {
              const at = 6 + j * 4;
              if (local < at) return null;
              const ok = local >= at + 3;
              return (
                <div key={t(item, "en")} style={{ display: "flex", gap: 16 }}>
                  <span style={{ color: ok ? K.green : K.cyan, width: 60 }}>{ok ? "PASS" : "RUN "}</span>
                  <span style={{ color: K.fg, fontWeight: 600 }}>{t(item, lang)}</span>
                  {ok && <span style={{ color: K.faint }}>{12 + ((j * 37 + current * 11) % 80)}ms</span>}
                </div>
              );
            })}
            {isAI && local > 6 + stage.items.length * 4 + 6 && (
              <div style={{ color: K.violet, marginTop: 6 }}>{copy.aiNote}</div>
            )}
          </>
        )}
      </div>

      {/* all green banner */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "58%",
          transform: `translate(-50%, -50%) scale(${banner})`,
          opacity: Math.min(1, Math.max(0, banner)),
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "30px 48px",
          borderRadius: 20,
          background: "rgba(74,222,128,0.14)",
          border: `3px solid ${K.green}`,
          boxShadow: `0 0 80px ${K.green}66`,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 44,
          color: K.fg,
          whiteSpace: "nowrap",
        }}
      >
        <CheckIcon size={52} color={K.green} strokeWidth={3.5} />
        {copy.pipelinePassed(t(D.highlights[0].value, lang), totalTests)}
      </div>
    </div>
  );
};
