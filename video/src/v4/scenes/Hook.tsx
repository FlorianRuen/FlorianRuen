import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, GRAD, L, P } from "../theme";
import { Caret, rise, Words } from "../ui";

/**
 * Bars 0-4: `whoami`, then the answer. The name lands with the first piano
 * chord, the three roles on the next ones, and the promise line on bar 2.5.
 * Everything pushes in and fades under the riser of bar 3.
 */
export const Hook: React.FC<{ copy: Copy4; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const cmd = copy.whoami;
  const typed = Math.floor(interpolate(frame, [6, 26], [0, cmd.length], clamp));
  const name = rise(frame, beat(2), 26);
  const tracking = interpolate(frame, [beat(2), beat(2) + 40], [26, -6], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const avatar = rise(frame, beat(2) + 6, 20);
  const headline = rise(frame, beat(3.5), 16);
  const roleAt = [bar(1), bar(1.5), bar(2)];
  const out = interpolate(frame, [bar(3.4), bar(4)], [1, 0], clamp);
  const push = interpolate(frame, [bar(3.2), bar(4)], [1, 1.08], { ...clamp, easing: (x) => x * x });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, transform: `scale(${push})` }}>
      {/* terminal prompt, top-left */}
      <div style={{ position: "absolute", left: L.left, top: 70, fontFamily: MONO, fontSize: 28, display: "flex", alignItems: "center" }}>
        <span style={{ color: P.green }}>➜ </span>
        <span style={{ color: P.cyan }}>~ </span>
        <span style={{ color: P.fg }}>{cmd.slice(0, typed)}</span>
        {frame < beat(2) && <Caret frame={frame} height={30} />}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <Img
            src={staticFile("avatar.jpg")}
            style={{
              width: 170,
              height: 170,
              borderRadius: "50%",
              objectFit: "cover",
              border: `3px solid ${P.fg}`,
              boxShadow: `0 0 0 10px ${P.blue}33, 0 30px 80px rgba(0,0,0,0.6)`,
              opacity: avatar,
              transform: `scale(${0.7 + avatar * 0.3})`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 150,
                lineHeight: 1,
                letterSpacing: tracking,
                color: P.fg,
                opacity: name,
                filter: `blur(${(1 - name) * 14}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {D.name}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 30, color: P.cyan, marginTop: 18, letterSpacing: 1, opacity: headline, transform: `translateY(${(1 - headline) * 12}px)` }}>
              {t(D.headline, lang)} <span style={{ color: P.faint }}>·</span> <span style={{ color: P.muted }}>{t(D.location, lang)}</span>
            </div>
          </div>
        </div>

        {/* roles, one per chord */}
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 90, fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: -2 }}>
          {copy.roles.map((r, i) => {
            const s = rise(frame, roleAt[i], 16);
            const active = frame >= roleAt[i] && (i === copy.roles.length - 1 || frame < roleAt[i + 1]);
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 34 }}>
                {i > 0 && <span style={{ color: P.faint, fontWeight: 300, opacity: s }}>→</span>}
                <span
                  style={{
                    display: "inline-block",
                    opacity: s,
                    transform: `translateY(${(1 - s) * 30}px)`,
                    filter: `blur(${(1 - s) * 8}px)`,
                    color: active ? "transparent" : P.muted,
                    backgroundImage: active ? GRAD : undefined,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  {r}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 70, maxWidth: 1400, textAlign: "center" }}>
          <Words text={copy.hookLine} at={bar(2.5)} size={46} weight={500} color={P.muted} stagger={2} style={{ justifyContent: "center" }} />
        </div>
      </div>
    </div>
  );
};
