import { Composition } from "remotion";
import { ResumeVideo } from "./ResumeVideo";
import { FPS, TOTAL_FRAMES } from "./theme";

export const Root: React.FC = () => (
  <>
    {(["en", "fr"] as const).map((lang) => (
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
  </>
);
