import type React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../components";
import { COPY4, type Copy4 } from "./copy";
import { Hook } from "./scenes/Hook";
import { Human } from "./scenes/Human";
import { Next } from "./scenes/Next";
import { Outro } from "./scenes/Outro";
import { Platform } from "./scenes/Platform";
import { Scale } from "./scenes/Scale";
import { Spark } from "./scenes/Spark";
import { Sudo } from "./scenes/Sudo";
import { accentAt, P, type SceneKey4, span4 } from "./theme";
import { Backdrop, Rail, Scene } from "./ui";

type SceneProps = { copy: Copy4; lang: Lang };
const SCENES: [SceneKey4, React.FC<SceneProps>, number][] = [
  ["hook", Hook, 0.35],
  ["spark", Spark, 0.55],
  ["scale", Scale, 0.65],
  ["platform", Platform, 0.7],
  ["human", Human, 0.3],
  ["next", Next, 1],
  ["sudo", Sudo, 0.4],
  ["outro", Outro, 0.5],
];

/**
 * v4: a story in chapters. The spark (Eyes'R), scale (CIDgravity), the
 * platform (OVHcloud), who I am (the ridge ride), what's next (ambitions),
 * `sudo hire florian`, then the contact card. Original cinematic score,
 * 100 BPM, 76.8 s.
 */
export const ResumeVideoV4: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const copy = COPY4[lang];
  const accent = accentAt(frame);
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  let energy = 0.5;
  for (const [key, , e] of SCENES) if (frame >= span4(key).from) energy = e;

  return (
    <AbsoluteFill style={{ opacity: fadeIn, background: P.bg }}>
      <Backdrop frame={frame} accent={accent} energy={energy} />
      {SCENES.map(([key, Comp]) => {
        const s = span4(key);
        return (
          <Sequence key={key} from={s.from} durationInFrames={s.duration} layout="none">
            <Scene duration={s.duration} push={key !== "human"}>
              <Comp copy={copy} lang={lang} />
            </Scene>
          </Sequence>
        );
      })}
      <Rail frame={frame} accent={accent} labels={copy.chapters} />
      <Audio src={staticFile("soundtrack-v4.wav")} />
    </AbsoluteFill>
  );
};
