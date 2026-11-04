import { interpolate, useCurrentFrame } from "remotion";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO } from "../../theme";
import type { Copy2 } from "../copy";
import { bar, beat, K } from "../theme";

/** Bars 30-32 (tension): the website's own easter egg, `sudo hire florian`. */
export const Sudo: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const cmd = "sudo hire florian";
  const typed = Math.floor(interpolate(frame, [4, beat(2.5)], [0, cmd.length], clamp));
  const promptAt = beat(3);
  const stars = Math.floor(interpolate(frame, [promptAt + 4, bar(1.4)], [0, 8], clamp));
  const grantedAt = bar(1.5); // music: chime on bar 31 beat 2
  const g = interpolate(frame, [grantedAt, grantedAt + 6], [0, 1], clamp);
  const flash = frame < grantedAt ? 0 : interpolate(frame, [grantedAt, grantedAt + 10], [0.35, 0], clamp);

  return (
    <div style={{ position: "absolute", inset: 0, background: K.chrome, padding: "60px 80px", fontFamily: MONO, fontSize: 40, lineHeight: 1.9 }}>
      <div>
        <span style={{ color: K.green }}>➜ </span>
        <span style={{ color: K.cyan }}>~ </span>
        <span style={{ color: K.fg }}>{cmd.slice(0, typed)}</span>
        {frame < promptAt && <Caret frame={frame} />}
      </div>
      {frame >= promptAt && (
        <div style={{ color: K.dim }}>
          {copy.sudoPrompt} <span style={{ color: K.fg }}>{"•".repeat(stars)}</span>
          {frame < grantedAt && <Caret frame={frame} />}
        </div>
      )}
      {frame >= grantedAt && (
        <div style={{ opacity: g, marginTop: 20 }}>
          <div style={{ color: K.green, fontWeight: 700, fontSize: 64 }}>✓ {copy.granted}</div>
          <div style={{ color: K.fg }}>{copy.grantedSub}</div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: K.green, opacity: flash, pointerEvents: "none" }} />
    </div>
  );
};

const Caret: React.FC<{ frame: number }> = ({ frame }) => (
  <span style={{ display: "inline-block", width: 20, height: 44, marginLeft: 6, verticalAlign: "middle", background: K.fg, opacity: frame % 20 < 12 ? 1 : 0.1 }} />
);
