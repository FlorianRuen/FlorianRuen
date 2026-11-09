import type React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../components";
import { Ide, IdeTimelineContext } from "../v2/Ide";
import { Backdrop } from "../v2/ResumeVideoV2";
import { Dashboard } from "../v2/scenes/Dashboard";
import { Editor } from "../v2/scenes/Editor";
import { GitLog } from "../v2/scenes/GitLog";
import { Outro } from "../v2/scenes/Outro";
import { Pipeline } from "../v2/scenes/Pipeline";
import { Sudo } from "../v2/scenes/Sudo";
import { K } from "../v2/theme";
import { COPY3, type Copy3 } from "./copy";
import { Exit } from "./scenes/Exit";
import { Trail } from "./scenes/Trail";
import { type SceneKey3, span3, TIMELINE3 } from "./theme";

type SceneProps = { copy: Copy3; lang: Lang };
const IN_IDE: [SceneKey3, React.FC<SceneProps>][] = [
  ["editor", Editor],
  ["gitlog", GitLog],
  ["pipeline", Pipeline],
  // Interests now get their own chapter on the trail.
  ["dashboard", (p) => <Dashboard {...p} showInterests={false} />],
  ["exit", Exit],
  ["sudo", Sudo],
];

/**
 * v3: what I know (the v2 IDE, shortened), then who I am (a mountain-bike
 * ride where soft skills are checkpoints), then back to `sudo hire florian`.
 */
export const ResumeVideoV3: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const copy = COPY3[lang];
  const trail = span3("trail");
  const outro = span3("outro");
  const fadeIn = interpolate(frame, [0, 8], [0, 1], clamp);
  const ideVisible = (frame < trail.from + 30 || frame >= trail.from + trail.duration) && frame < outro.from + 30;

  return (
    <AbsoluteFill style={{ opacity: fadeIn, background: K.page }}>
      <Backdrop frame={frame} />
      <Sequence from={trail.from} durationInFrames={trail.duration}>
        <Trail copy={copy} lang={lang} />
      </Sequence>
      <IdeTimelineContext.Provider value={TIMELINE3}>
        {ideVisible && (
          <Ide>
            {IN_IDE.map(([key, Scene]) => {
              const s = span3(key);
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
      </IdeTimelineContext.Provider>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <Outro copy={copy} lang={lang} />
      </Sequence>
      <Audio src={staticFile("soundtrack-v3.wav")} />
    </AbsoluteFill>
  );
};

const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{children}</AbsoluteFill>;
};
