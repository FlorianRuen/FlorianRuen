import { interpolate, random, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, Flash, GradientText, Kicker, popAt, SceneShell } from "../components";
import type { Copy } from "../copy";
import { BEAT, C, SANS, SCENES } from "../theme";

const SOFT = D.skills[0].items;

/**
 * 38-46 s, the musical break: soft skills slam in one per half-beat,
 * scattered around a central quote.
 */
export const Human: React.FC<{ copy: Copy; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const quote = copy.humanQuote;
  const words = quote.split(" ");
  const quoteStart = 6;

  // Fixed slots around the centre (x, y in px), so nothing overlaps the quote.
  const slots = [
    [150, 230],
    [1450, 220],
    [640, 200],
    [200, 740],
    [1180, 330],
    [800, 720],
    [1320, 760],
    [480, 880],
    [1060, 880],
  ];

  return (
    <SceneShell duration={SCENES.human.duration}>
      <Flash strength={0.25} />
      <div style={{ position: "absolute", left: 130, top: 110 }}>
        <Kicker>{copy.humanKicker}</Kicker>
      </div>

      {SOFT.map((item, i) => {
        const label = t(item, lang);
        const at = 30 + i * (BEAT / 2) * 1.5;
        const s = popAt(frame, at, 8);
        const [x, y] = slots[i % slots.length];
        const drift = Math.sin((frame + i * 20) / 30) * 8;
        const hue = [C.cyan, C.blue, C.violet][i % 3];
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: y + drift,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 46,
              padding: "12px 30px",
              borderRadius: 999,
              border: `2px solid ${hue}`,
              color: C.fg,
              background: `${hue}1f`,
              boxShadow: `0 0 30px ${hue}44`,
              opacity: Math.min(1, Math.max(0, s)) * 0.95,
              transform: `scale(${s}) rotate(${(random(`r${i}`) - 0.5) * 8}deg)`,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        );
      })}

      {/* central quote, word by word */}
      <div
        style={{
          position: "absolute",
          left: 300,
          right: 300,
          top: 420,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 82,
          letterSpacing: -2.5,
          lineHeight: 1.08,
          color: C.fg,
        }}
      >
        {words.map((w, i) => {
          const at = quoteStart + i * 3;
          const o = interpolate(frame, [at, at + 6], [0, 1], clamp);
          const highlight = i >= words.length - 3;
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: words can repeat
              key={i}
              style={{
                display: "inline-block",
                marginRight: 22,
                opacity: o,
                transform: `translateY(${(1 - o) * 30}px)`,
                filter: `blur(${(1 - o) * 8}px)`,
              }}
            >
              {highlight ? <GradientText>{w}</GradientText> : w}
            </span>
          );
        })}
      </div>
    </SceneShell>
  );
};
