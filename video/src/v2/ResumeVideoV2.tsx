import type React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../components";
import { COPY2, type Copy2 } from "./copy";
import { Ide } from "./Ide";
import { Apply } from "./scenes/Apply";
import { Cluster } from "./scenes/Cluster";
import { Dashboard } from "./scenes/Dashboard";
import { Editor } from "./scenes/Editor";
import { GitLog } from "./scenes/GitLog";
import { Outro } from "./scenes/Outro";
import { Pipeline } from "./scenes/Pipeline";
import { Sudo } from "./scenes/Sudo";
import { K, type SceneKey, span } from "./theme";

type SceneProps = { copy: Copy2; lang: Lang };
const IN_IDE: [SceneKey, React.FC<SceneProps>][] = [
  ["editor", Editor],
  ["gitlog", GitLog],
  ["pipeline", Pipeline],
  ["apply", Apply],
  ["cluster", Cluster],
  ["dashboard", Dashboard],
  ["sudo", Sudo],
];

/** Dark backdrop behind the IDE: dot grid drifting slowly + glow. */
const Backdrop: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ background: K.page, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        inset: -100,
        backgroundImage: "radial-gradient(rgba(130,170,255,0.18) 1.5px, transparent 1.5px)",
        backgroundSize: "36px 36px",
        transform: `translate(${(frame * 0.4) % 36}px, ${(frame * 0.25) % 36}px)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 1400,
        height: 1400,
        left: 260 + Math.sin(frame / 80) * 100,
        top: -400,
        background: `radial-gradient(circle, ${K.blue}30, transparent 60%)`,
      }}
    />
    {/* binary rain at the edges, very faint */}
    {Array.from({ length: 26 }).map((_, i) => {
      const x = i < 13 ? i * 2.2 : 72 + (i - 13) * 2.2;
      const y = ((random(`y${i}`) * 1400 + frame * (2 + random(`s${i}`) * 3)) % 1400) - 200;
      return (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          key={i}
          style={{ position: "absolute", left: `${x}%`, top: y, fontFamily: "monospace", fontSize: 16, color: K.cyan, opacity: 0.12, writingMode: "vertical-rl" }}
        >
          {Array.from({ length: 10 }, (_, k) => (random(`b${i}-${k}-${Math.floor(frame / 6)}`) > 0.5 ? 1 : 0)).join("")}
        </div>
      );
    })}
  </AbsoluteFill>
);

export const ResumeVideoV2: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const copy = COPY2[lang];
  const outro = span("outro");
  const fadeIn = interpolate(frame, [0, 8], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Backdrop frame={frame} />
      {frame < outro.from + 30 && (
        <Ide>
          {IN_IDE.map(([key, Scene]) => {
            const s = span(key);
            return (
              <Sequence key={key} from={s.from} durationInFrames={s.duration} layout="none">
                <SceneFade>
                  <Scene copy={copy} lang={lang} />
                </SceneFade>
              </Sequence>
            );
          })}
        </Ide>
      )}
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <Outro copy={copy} lang={lang} />
      </Sequence>
      <Audio src={staticFile("soundtrack-v2.wav")} />
    </AbsoluteFill>
  );
};

/** Quick slide-in so each "file" opens with a little motion. */
const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{children}</AbsoluteFill>;
};
