import { Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, GRAD, P } from "../theme";
import { Caret, Flash, rise, Slam } from "../fx";

/**
 * Bars 0-4. Cold open on black: `whoami` types with key clicks, the name
 * SLAMS in on the first hit (bar 2) with the avatar, then one role per beat
 * on bar 3, each replacing the last. The riser builds under it all.
 */
export const Cold: React.FC<{ copy: Copy5; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const cmd = copy.whoami;
  const typed = Math.floor(interpolate(frame, [10, 40], [0, cmd.length], clamp));
  const nameAt = bar(2);
  const name = rise(frame, nameAt, 9);
  const nameScale = interpolate(frame, [nameAt, nameAt + 9], [3, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 4 });
  const sub = rise(frame, nameAt + beat(1), 10);
  const roleAt = [bar(3), bar(3) + beat(1), bar(3) + beat(2)];
  const out = interpolate(frame, [bar(4) - 4, bar(4)], [1, 0], clamp);
  // streaks racing towards the camera from bar 3
  const streak = interpolate(frame, [bar(3), bar(4)], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      {/* terminal line */}
      <div style={{ position: "absolute", left: 120, top: 100, fontFamily: MONO, fontSize: 34, display: "flex", alignItems: "center", opacity: interpolate(frame, [nameAt, nameAt + 6], [1, 0.35], clamp) }}>
        <span style={{ color: P.green }}>➜ </span>
        <span style={{ color: P.cyan }}>~ </span>
        <span style={{ color: P.fg }}>{cmd.slice(0, typed)}</span>
        {frame < nameAt && <Caret frame={frame} height={36} />}
      </div>

      {/* streaks */}
      {streak > 0 && (
        <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 40 }).map((_, i) => {
            const a = random(`ca${i}`) * Math.PI * 2;
            const r0 = 200 + ((frame * (8 + random(`cs${i}`) * 16) + random(`cr${i}`) * 1200) % 1200);
            const len = 60 + streak * 260;
            return (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: decorative
                key={i}
                x1={960 + Math.cos(a) * r0}
                y1={540 + Math.sin(a) * r0 * 0.6}
                x2={960 + Math.cos(a) * (r0 + len)}
                y2={540 + Math.sin(a) * (r0 + len) * 0.6}
                stroke={[P.cyan, P.blue, P.violet][i % 3]}
                strokeOpacity={0.5 * streak}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {/* name */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 50, opacity: name, transform: `scale(${nameScale})` }}>
          <Img src={staticFile("avatar.jpg")} style={{ width: 190, height: 190, borderRadius: "50%", objectFit: "cover", border: `4px solid ${P.fg}`, boxShadow: `0 0 0 12px ${P.blue}44, 0 40px 100px rgba(0,0,0,0.7)` }} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 190, letterSpacing: -10, lineHeight: 1, color: P.fg, whiteSpace: "nowrap" }}>{D.name}</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 34, color: P.cyan, letterSpacing: 2, marginTop: 30, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          {t(D.headline, lang)} <span style={{ color: P.faint }}>·</span> <span style={{ color: P.muted }}>{t(D.location, lang)}</span>
        </div>
        {/* roles, each replacing the previous on its beat */}
        <div style={{ position: "relative", height: 140, marginTop: 60, width: 1600, display: "flex", justifyContent: "center" }}>
          {copy.roles.map((r, i) => (
            <div key={r} style={{ position: "absolute" }}>
              <Slam text={r} at={roleAt[i]} until={i < 2 ? roleAt[i + 1] : undefined} size={120} gradient={i === 2 ? GRAD : undefined} color={P.fg} align="center" stagger={3} outDir={[0, -90]} />
            </div>
          ))}
        </div>
      </div>
      <Flash at={nameAt} strength={0.6} len={6} />
    </div>
  );
};
