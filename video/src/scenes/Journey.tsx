import { TrophyIcon } from "lucide-react";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { formatDate, type Lang, t } from "@/lib/i18n";
import { clamp, Flash, GradientText, Kicker, popAt, SceneShell } from "../components";
import type { Copy } from "../copy";
import { BAR, BEAT, C, MONO, SANS, SCENES } from "../theme";

/** Oldest first, so the story moves forward in time. */
const JOBS = [...D.work].reverse();
const PER_JOB = 2 * BAR;

/** 22-38 s: a timeline rail at the bottom, one company per 2 bars. */
export const Journey: React.FC<{ copy: Copy; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const active = Math.min(JOBS.length - 1, Math.floor(frame / PER_JOB));
  const railProgress = interpolate(frame, [0, PER_JOB * JOBS.length - 20], [0, 1], clamp);

  return (
    <SceneShell duration={SCENES.journey.duration}>
      <div style={{ position: "absolute", left: 130, top: 110 }}>
        <Kicker>{copy.journeyKicker}</Kicker>
      </div>

      {JOBS.map((job, i) => (
        <Sequence key={job.company} from={i * PER_JOB} durationInFrames={PER_JOB} layout="none">
          <JobCard job={job} copy={copy} lang={lang} />
        </Sequence>
      ))}

      {/* timeline rail */}
      <div style={{ position: "absolute", left: 160, right: 160, bottom: 120 }}>
        <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            height: 4,
            width: `${railProgress * 100}%`,
            background: `linear-gradient(90deg, ${C.cyan}, ${C.blue}, ${C.violet})`,
            boxShadow: `0 0 20px ${C.cyan}`,
            borderRadius: 2,
          }}
        />
        {JOBS.map((job, i) => {
          const x = (i / (JOBS.length - 1)) * 100;
          const isActive = i === active;
          const reached = i <= active;
          const start = job.roles[job.roles.length - 1].start.slice(0, 4);
          return (
            <div
              key={job.company}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: -12,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: reached ? C.cyan : C.bg2,
                  border: `3px solid ${reached ? C.fg : "rgba(255,255,255,0.25)"}`,
                  boxShadow: isActive ? `0 0 30px ${C.cyan}` : "none",
                  transform: `scale(${isActive ? 1.3 : 1})`,
                }}
              />
              <div
                style={{
                  marginTop: 16,
                  fontFamily: MONO,
                  fontSize: 24,
                  color: isActive ? C.fg : C.muted,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {start}
                <div style={{ fontSize: 20, opacity: 0.8 }}>{job.company}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

type Job = (typeof D.work)[number];

const JobCard: React.FC<{ job: Job; copy: Copy; lang: Lang }> = ({ job, copy, lang }) => {
  const frame = useCurrentFrame();
  const enter = popAt(frame, 0, 12);
  const exit = interpolate(frame, [PER_JOB - 8, PER_JOB], [0, 1], clamp);
  const roles = job.roles;
  const current = roles[0];
  const first = roles[roles.length - 1];
  const isNow = current.end === null;
  const hasPress = "press" in job;
  const isFounder = job.company === "Eyes'R";
  const promoted = roles.length > 1;

  return (
    <>
      <Flash length={6} strength={0.18} />
      <div
        style={{
          position: "absolute",
          left: 130,
          right: 130,
          top: 200,
          opacity: Math.min(1, enter) * (1 - exit),
          transform: `translateX(${(1 - enter) * 200 - exit * 200}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 32 }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 140,
              letterSpacing: -5,
              lineHeight: 1,
              color: C.fg,
            }}
          >
            {job.company}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            {formatDate(first.start, lang)} → {formatDate(current.end, lang)}
          </div>
          {isNow && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 24,
                color: C.green,
                border: `2px solid ${C.green}`,
                borderRadius: 999,
                padding: "4px 16px",
                opacity: frame % 30 < 20 ? 1 : 0.5,
              }}
            >
              ● NOW
            </div>
          )}
        </div>

        {/* role(s) */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 20 }}>
          {[...roles].reverse().map((r, i) => {
            const s = popAt(frame, 8 + i * BEAT * 2, 10);
            return (
              <div key={r.title.en} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {i > 0 && (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 26,
                      color: C.gold,
                      opacity: Math.min(1, s),
                    }}
                  >
                    ⇧ {copy.promoted}
                  </span>
                )}
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 54,
                    color: C.fg,
                    whiteSpace: "nowrap",
                    opacity: Math.min(1, s) * (promoted && i === 0 ? 0.55 : 1),
                    transform: `scale(${s})`,
                    transformOrigin: "left center",
                  }}
                >
                  {i === roles.length - 1 ? <GradientText>{t(r.title, lang)}</GradientText> : t(r.title, lang)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 30,
            maxWidth: 1400,
            fontFamily: SANS,
            fontSize: 42,
            fontWeight: 500,
            lineHeight: 1.3,
            color: C.fg,
            opacity: interpolate(frame, [14, 24], [0, 0.9], clamp),
          }}
        >
          {copy.companies[job.company] ?? t(current.bullets[0], lang)}
        </div>

        {/* tech chips */}
        <div style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {job.tech.map((tech, i) => {
            const s = popAt(frame, 22 + i * 3, 8);
            return (
              <div
                key={tech}
                style={{
                  fontFamily: MONO,
                  fontSize: 26,
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: `1px solid ${C.blue}66`,
                  background: `${C.primary}22`,
                  color: C.fg,
                  opacity: Math.min(1, s),
                  transform: `translateY(${(1 - s) * 30}px)`,
                }}
              >
                {tech}
              </div>
            );
          })}
        </div>

        {/* founder extras: award + press */}
        {isFounder && (
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 36 }}>
            <Award label={copy.award} at={BAR - BEAT} />
          </div>
        )}
        {hasPress && (
          <div
            style={{
              marginTop: 22,
              fontFamily: MONO,
              fontSize: 24,
              color: C.muted,
              opacity: interpolate(frame, [BAR + 5, BAR + 15], [0, 1], clamp),
            }}
          >
            {copy.press}:{" "}
            {job.press.items.map((p, i) => (
              <span
                key={p.name}
                style={{
                  color: C.fg,
                  opacity: interpolate(frame, [BAR + 5 + i * 3, BAR + 10 + i * 3], [0, 1], clamp),
                }}
              >
                {i > 0 ? " · " : ""}
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const Award: React.FC<{ label: string; at: number }> = ({ label, at }) => {
  const frame = useCurrentFrame();
  const s = popAt(frame, at, 14);
  const shine = interpolate(frame, [at + 10, at + 40], [-100, 200], clamp);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 30px",
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(251,191,36,0.05))",
        border: `2px solid ${C.gold}`,
        boxShadow: `0 0 ${40 * Math.min(1, s)}px ${C.gold}88`,
        transform: `scale(${s}) rotate(${(1 - s) * -10}deg)`,
        opacity: Math.min(1, Math.max(0, s)),
        overflow: "hidden",
      }}
    >
      <TrophyIcon size={42} color={C.gold} />
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.gold }}>
        {label}
      </span>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${shine}%`,
          width: 80,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
          transform: "skewX(-20deg)",
        }}
      />
    </div>
  );
};
