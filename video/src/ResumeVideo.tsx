import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Lang } from "@/lib/i18n";
import { Background } from "./components";
import { COPY } from "./copy";
import { Boot } from "./scenes/Boot";
import { Education } from "./scenes/Education";
import { Hero } from "./scenes/Hero";
import { Human } from "./scenes/Human";
import { Journey } from "./scenes/Journey";
import { Numbers } from "./scenes/Numbers";
import { Outro } from "./scenes/Outro";
import { Stack } from "./scenes/Stack";
import { SCENES } from "./theme";

export type ResumeVideoProps = { lang: Lang };

export const ResumeVideo: React.FC<ResumeVideoProps> = ({ lang }) => {
  const frame = useCurrentFrame();
  const copy = COPY[lang];
  // The background is calmer in the intro and during the soft-skills break.
  const intensity =
    frame < SCENES.hero.from
      ? 0.3
      : frame >= SCENES.human.from && frame < SCENES.stack.from
        ? 0.5
        : 1;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Background frame={frame} intensity={intensity} />
      <Sequence from={SCENES.boot.from} durationInFrames={SCENES.boot.duration}>
        <Boot copy={copy} />
      </Sequence>
      <Sequence from={SCENES.hero.from} durationInFrames={SCENES.hero.duration}>
        <Hero copy={copy} lang={lang} />
      </Sequence>
      <Sequence from={SCENES.numbers.from} durationInFrames={SCENES.numbers.duration}>
        <Numbers copy={copy} lang={lang} />
      </Sequence>
      <Sequence from={SCENES.journey.from} durationInFrames={SCENES.journey.duration}>
        <Journey copy={copy} lang={lang} />
      </Sequence>
      <Sequence from={SCENES.human.from} durationInFrames={SCENES.human.duration}>
        <Human copy={copy} lang={lang} />
      </Sequence>
      <Sequence from={SCENES.stack.from} durationInFrames={SCENES.stack.duration}>
        <Stack copy={copy} lang={lang} />
      </Sequence>
      <Sequence from={SCENES.education.from} durationInFrames={SCENES.education.duration}>
        <Education copy={copy} lang={lang} />
      </Sequence>
      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.duration}>
        <Outro copy={copy} />
      </Sequence>
      <Audio src={staticFile("soundtrack.wav")} />
    </AbsoluteFill>
  );
};
