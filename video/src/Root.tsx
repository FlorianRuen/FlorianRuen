import { Composition } from "remotion";
import { ResumeVideo } from "./ResumeVideo";
import { FPS, TOTAL_FRAMES } from "./theme";
import { ResumeVideoV2 } from "./v2/ResumeVideoV2";
import { TOTAL_FRAMES as TOTAL_FRAMES_V2 } from "./v2/theme";

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
  </>
);
