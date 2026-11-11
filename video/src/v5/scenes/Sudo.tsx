import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, P } from "../theme";
import { Caret, Flash, pop, rise, Tag } from "../fx";

const GRANT_AT = bar(1.5);

/**
 * Bars 26-28. Everything stops: black, a heartbeat, a terminal full screen.
 * `sudo hire florian`, the password, then "Access granted." slams in green.
 */
export const Sudo: React.FC<{ copy: Copy5 }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const cmd = copy.sudoCmd;
  const typed = Math.floor(interpolate(frame, [6, beat(2.5)], [0, cmd.length], clamp));
  const promptAt = beat(3);
  const stars = Math.floor(interpolate(frame, [promptAt + 4, bar(1.3)], [0, 8], clamp));
  const g = pop(frame, GRANT_AT, 9);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#030405" }}>
      <Tag n={6} label={copy.ch.sudo} accent={P.green} />
      <div style={{ position: "absolute", left: 120, top: 330, fontFamily: MONO, fontSize: 64, lineHeight: 1.7 }}>
        <div>
          <span style={{ color: P.green }}>➜ </span>
          <span style={{ color: P.cyan }}>~ </span>
          <span style={{ color: P.fg }}>{cmd.slice(0, typed)}</span>
          {frame < promptAt && <Caret frame={frame} height={64} />}
        </div>
        {frame >= promptAt && (
          <div style={{ color: P.muted }}>
            {copy.sudoPrompt} <span style={{ color: P.fg }}>{"•".repeat(stars)}</span>
            {frame < GRANT_AT && <Caret frame={frame} height={64} />}
          </div>
        )}
        {frame >= GRANT_AT && (
          <div style={{ marginTop: 30, opacity: Math.min(1, g), transform: `scale(${g})`, transformOrigin: "left center" }}>
            <div style={{ color: P.green, fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: -6, lineHeight: 1, textShadow: `0 0 80px ${P.green}88` }}>✓ {copy.granted}</div>
            <div style={{ color: P.fg, fontSize: 44, marginTop: 20, opacity: rise(frame, GRANT_AT + 6, 8) }}>{copy.grantedSub}</div>
          </div>
        )}
      </div>
      <Flash at={GRANT_AT} color={P.green} strength={0.6} len={10} />
    </div>
  );
};
