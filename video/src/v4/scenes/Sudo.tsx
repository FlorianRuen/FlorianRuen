import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, P } from "../theme";
import { Caret, Chapter, Hit, rise } from "../ui";

/**
 * Bars 27-29: the website's own easter egg, `sudo hire florian`, in a
 * floating terminal. The music drops to a heartbeat; the chime lands on
 * "Access granted."
 */
export const Sudo: React.FC<{ copy: Copy4 }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const cmd = copy.sudoCmd;
  const win = rise(frame, 0, 16);
  const typed = Math.floor(interpolate(frame, [8, beat(2.5)], [0, cmd.length], clamp));
  const promptAt = beat(3);
  const stars = Math.floor(interpolate(frame, [promptAt + 6, bar(1.3)], [0, 8], clamp));
  const grantedAt = bar(1.5);
  const g = rise(frame, grantedAt, 10);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Chapter index={6} label={copy.chapters.sudo} accent={P.green} />
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 250,
          width: 1400,
          borderRadius: 18,
          overflow: "hidden",
          background: "#0a0c13",
          border: `1px solid ${P.line}`,
          boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 100px ${P.green}1a`,
          opacity: win,
          transform: `translateY(${(1 - win) * 40}px) scale(${0.96 + win * 0.04})`,
        }}
      >
        <div style={{ height: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 18px", background: "#0f111a", borderBottom: `1px solid ${P.line}` }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
          ))}
          <div style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 17, color: P.muted }}>recruiter@laptop — zsh</div>
        </div>
        <div style={{ padding: "40px 50px 50px", fontFamily: MONO, fontSize: 42, lineHeight: 1.9, minHeight: 400 }}>
          <div>
            <span style={{ color: P.green }}>➜ </span>
            <span style={{ color: P.cyan }}>~ </span>
            <span style={{ color: P.fg }}>{cmd.slice(0, typed)}</span>
            {frame < promptAt && <Caret frame={frame} />}
          </div>
          {frame >= promptAt && (
            <div style={{ color: P.muted }}>
              {copy.sudoPrompt} <span style={{ color: P.fg }}>{"•".repeat(stars)}</span>
              {frame < grantedAt && <Caret frame={frame} />}
            </div>
          )}
          {frame >= grantedAt && (
            <div style={{ opacity: g, marginTop: 20, transform: `translateY(${(1 - g) * 10}px)` }}>
              <div style={{ color: P.green, fontFamily: SANS, fontWeight: 900, fontSize: 76, letterSpacing: -2, lineHeight: 1.2 }}>✓ {copy.granted}</div>
              <div style={{ color: P.fg, fontSize: 36, marginTop: 6 }}>{copy.grantedSub}</div>
            </div>
          )}
        </div>
      </div>
      <Hit at={grantedAt} color={P.green} strength={0.25} len={16} />
    </div>
  );
};
