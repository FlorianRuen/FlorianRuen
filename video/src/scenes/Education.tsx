import { GraduationCapIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, Flash, Kicker, popAt, SceneShell } from "../components";
import type { Copy } from "../copy";
import { BAR, BEAT, C, MONO, SANS, SCENES } from "../theme";

/** 54-60 s: degrees on the left; projects, volunteering and interests on the right. */
export const Education: React.FC<{ copy: Copy; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const beyond = [
    ...D.projects.map((p) => p.title),
    ...D.interests.map((i) => t(i, lang)),
  ];

  return (
    <SceneShell duration={SCENES.education.duration}>
      <Flash strength={0.3} />
      <div
        style={{
          position: "absolute",
          inset: "110px 130px",
          display: "flex",
          gap: 90,
        }}
      >
        <div style={{ flex: 1.3 }}>
          <Kicker>{copy.eduKicker}</Kicker>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 34 }}>
            {D.education.map((e, i) => {
              const s = popAt(frame, 6 + i * BEAT, 10);
              const main = i === 0;
              return (
                <div
                  key={t(e.degree, "en")}
                  style={{
                    display: "flex",
                    gap: 26,
                    opacity: Math.min(1, Math.max(0, s)) * (main ? 1 : 0.75),
                    transform: `translateX(${(1 - s) * -120}px)`,
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 26, color: C.cyan, width: 170, paddingTop: 10 }}>
                    {e.start}–{e.end}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        fontFamily: SANS,
                        fontWeight: 900,
                        fontSize: main ? 64 : 40,
                        letterSpacing: main ? -2 : -1,
                        color: C.fg,
                      }}
                    >
                      {main && <GraduationCapIcon size={60} color={C.cyan} />}
                      {e.school}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: main ? 32 : 26, color: C.muted, marginTop: 6 }}>
                      {t(e.degree, lang)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Kicker delay={BAR}>{copy.beyondKicker}</Kicker>
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 16 }}>
            {beyond.map((label, i) => {
              const s = popAt(frame, BAR + 8 + i * 3, 8);
              return (
                <div
                  key={label}
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 32,
                    padding: "12px 26px",
                    borderRadius: 999,
                    border: `1px solid ${i < D.projects.length ? `${C.gold}aa` : C.border}`,
                    background: i < D.projects.length ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.05)",
                    color: C.fg,
                    opacity: Math.min(1, Math.max(0, s)),
                    transform: `scale(${s})`,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: SANS,
              fontSize: 30,
              lineHeight: 1.4,
              color: C.muted,
              opacity: interpolate(frame, [BAR + 40, BAR + 55], [0, 1], clamp),
            }}
          >
            {t(D.projects[0].description, lang)}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
