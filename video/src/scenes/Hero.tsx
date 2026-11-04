import { MapPinIcon } from "lucide-react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, Flash, Glitch, GradientText, popAt, SceneShell, useEnter } from "../components";
import type { Copy } from "../copy";
import { BEAT, C, MONO, SANS, SCENES } from "../theme";

/** 6-14 s: the drop. Name, headline, and the Engineer → Founder → Leader path. */
export const Hero: React.FC<{ copy: Copy; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const avatar = useEnter(0, { damping: 11, stiffness: 120 });
  const name = useEnter(4);
  const headline = t(D.headline, lang);
  const typed = Math.floor(interpolate(frame, [20, 50], [0, headline.length], clamp));
  const loc = useEnter(50);
  const ringRotate = frame * 2;

  return (
    <SceneShell duration={SCENES.hero.duration}>
      <Flash />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 90,
          paddingBottom: 60,
        }}
      >
        {/* avatar with rotating gradient ring */}
        <div
          style={{
            position: "relative",
            width: 380,
            height: 380,
            transform: `scale(${avatar}) rotate(${(1 - avatar) * -20}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: "50%",
              background: `conic-gradient(from ${ringRotate}deg, ${C.cyan}, ${C.blue}, ${C.violet}, ${C.cyan})`,
              filter: "blur(2px)",
              boxShadow: `0 0 80px ${C.blue}88`,
            }}
          />
          <Img
            src={staticFile("avatar.jpg")}
            style={{
              position: "absolute",
              inset: 0,
              width: 380,
              height: 380,
              borderRadius: "50%",
              objectFit: "cover",
              border: `8px solid ${C.bg}`,
            }}
          />
        </div>

        <div style={{ width: 960 }}>
          <Glitch at={4} length={14}>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 150,
                lineHeight: 0.95,
                letterSpacing: -6,
                color: C.fg,
                opacity: name,
                transform: `translateY(${(1 - name) * 60}px)`,
              }}
            >
              {D.name}
            </div>
          </Glitch>
          <div
            style={{
              marginTop: 24,
              fontFamily: MONO,
              fontSize: 40,
              color: C.blue,
              height: 52,
            }}
          >
            {headline.slice(0, typed)}
            {typed < headline.length && frame > 18 && <span style={{ color: C.fg }}>▍</span>}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: MONO,
              fontSize: 28,
              color: C.muted,
              opacity: loc,
            }}
          >
            <MapPinIcon size={28} color={C.cyan} /> {t(D.location, lang)}
          </div>

          {/* path, one word per beat */}
          <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 26 }}>
            {copy.path.map((word, i) => {
              const at = 75 + i * BEAT * 2;
              const s = popAt(frame, at);
              const isLast = i === copy.path.length - 1;
              return (
                <div key={word} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                  {i > 0 && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 44,
                        color: C.cyan,
                        opacity: s,
                      }}
                    >
                      →
                    </span>
                  )}
                  <div
                    style={{
                      fontFamily: SANS,
                      fontWeight: 800,
                      fontSize: 58,
                      letterSpacing: -1.5,
                      whiteSpace: "nowrap",
                      transform: `scale(${0.4 + s * 0.6}) translateY(${(1 - s) * 30}px)`,
                      opacity: s,
                      color: C.fg,
                    }}
                  >
                    {isLast ? <GradientText>{word}</GradientText> : word}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
