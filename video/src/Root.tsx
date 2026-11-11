import { Composition } from "remotion";
import { Icon } from "./Icon";
import { ResumeVideo } from "./ResumeVideo";
import { FPS, TOTAL_FRAMES } from "./theme";
import { ResumeVideoV2 } from "./v2/ResumeVideoV2";
import { TOTAL_FRAMES as TOTAL_FRAMES_V2 } from "./v2/theme";
import { ResumeVideoV3 } from "./v3/ResumeVideoV3";
import { TOTAL_FRAMES as TOTAL_FRAMES_V3 } from "./v3/theme";
import { ResumeVideoV4 } from "./v4/ResumeVideoV4";
import { TOTAL_FRAMES as TOTAL_FRAMES_V4 } from "./v4/theme";
import { ResumeVideoV5 } from "./v5/ResumeVideoV5";
import { TOTAL_FRAMES as TOTAL_FRAMES_V5 } from "./v5/theme";

const LANGS = ["en", "fr"] as const;

export const Root: React.FC = () => (
  <>
    {/* v1: kinetic typography */}
    {LANGS.map((lang) => (
      <Composition
        key={lang}
        id={`resume-${lang}`}
        component={ResumeVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {/* v2: career deployed from an IDE */}
    {LANGS.map((lang) => (
      <Composition
        key={`v2-${lang}`}
        id={`resume-v2-${lang}`}
        component={ResumeVideoV2}
        durationInFrames={TOTAL_FRAMES_V2}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {/* v3: what I know (IDE), then who I am (mountain-bike trail) */}
    {LANGS.map((lang) => (
      <Composition
        key={`v3-${lang}`}
        id={`resume-v3-${lang}`}
        component={ResumeVideoV3}
        durationInFrames={TOTAL_FRAMES_V3}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {/* v4: a story in chapters on a cinematic score */}
    {LANGS.map((lang) => (
      <Composition
        key={`v4-${lang}`}
        id={`resume-v4-${lang}`}
        component={ResumeVideoV4}
        durationInFrames={TOTAL_FRAMES_V4}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {/* v5: the trailer, cuts on the beat, kinetic typography */}
    {LANGS.map((lang) => (
      <Composition
        key={`v5-${lang}`}
        id={`resume-v5-${lang}`}
        component={ResumeVideoV5}
        durationInFrames={TOTAL_FRAMES_V5}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {/* Site icon, rendered as stills by scripts/make-icons.mjs */}
    <Composition id="icon" component={Icon} durationInFrames={1} fps={FPS} width={512} height={512} defaultProps={{ full: false }} />
  </>
);
