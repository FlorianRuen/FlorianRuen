import type React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../components";
import { COPY5, type Copy5 } from "./copy";
import { Camera, Post, Shot } from "./fx";
import { Cold } from "./scenes/Cold";
import { Human } from "./scenes/Human";
import { Next } from "./scenes/Next";
import { Outro } from "./scenes/Outro";
import { Platform } from "./scenes/Platform";
import { Scale } from "./scenes/Scale";
import { Spark } from "./scenes/Spark";
import { Sudo } from "./scenes/Sudo";
import { P, type SceneKey5, span5 } from "./theme";

type SceneProps = { copy: Copy5; lang: Lang };
/** The "cold" and "roles" spans are one shot (Cold); the rest one per key. */
const SHOTS: [SceneKey5, SceneKey5, React.FC<SceneProps>][] = [
  ["cold", "roles", Cold],
  ["spark", "spark", Spark],
  ["scale", "scale", Scale],
  ["platform", "platform", Platform],
  ["human", "human", Human],
  ["next", "next", Next],
  ["sudo", "sudo", Sudo],
  ["outro", "outro", Outro],
];

/**
 * v5: the trailer. One continuous camera, hard cuts on the bars of a 128 BPM
 * electro track, kinetic typography, full-bleed moving sets. 60 s.
 */
export const ResumeVideoV5: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const copy = COPY5[lang];
  const fadeIn = interpolate(frame, [0, 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: P.bg, opacity: fadeIn }}>
      <Post frame={frame}>
        <Camera frame={frame}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${P.bg2}, ${P.bg} 70%)` }} />
          {SHOTS.map(([a, b, Comp]) => {
            const from = span5(a).from;
            const end = span5(b).from + span5(b).duration;
            const duration = end - from;
            return (
              <Sequence key={a} from={from} durationInFrames={duration} layout="none">
                <Shot duration={duration} fadeOut={a === "human" || a === "sudo" ? 6 : 0}>
                  <Comp copy={copy} lang={lang} />
                </Shot>
              </Sequence>
            );
          })}
        </Camera>
      </Post>
      <Audio src={staticFile("soundtrack-v5.wav")} />
    </AbsoluteFill>
  );
};
