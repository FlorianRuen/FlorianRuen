import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../components";
import { MONO } from "../../theme";
import { K } from "../../v2/theme";
import type { Copy3 } from "../copy";

/** Bar 22: `exit`, the only bar where the music drops its kick. The IDE then flies away. */
export const Exit: React.FC<{ copy: Copy3 }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const typed = Math.floor(interpolate(frame, [4, 20], [0, copy.exitCmd.length], clamp));
  const line = (at: number) => interpolate(frame, [at, at + 5], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", inset: 0, background: K.chrome, padding: "60px 80px", fontFamily: MONO, fontSize: 40, lineHeight: 1.9 }}>
      <div>
        <span style={{ color: K.green }}>➜ </span>
        <span style={{ color: K.cyan }}>~ </span>
        <span style={{ color: K.fg }}>{copy.exitCmd.slice(0, typed)}</span>
        {frame < 24 && (
          <span style={{ display: "inline-block", width: 20, height: 44, marginLeft: 6, verticalAlign: "middle", background: K.fg, opacity: frame % 20 < 12 ? 1 : 0.1 }} />
        )}
      </div>
      <div style={{ color: K.dim, opacity: line(24) }}>{copy.exitOut[0]}</div>
      <div style={{ color: K.yellow, opacity: line(32) }}>{copy.exitOut[1]}</div>
    </div>
  );
};
