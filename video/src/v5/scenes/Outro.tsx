import { MailIcon } from "lucide-react";
import { Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { clamp } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy5 } from "../copy";
import { bar, beat, GRAD, P } from "../theme";
import { Flash, kick, pop, rise, Slam } from "../fx";

/** Bars 28-32. The final drop: the closing line slams, the card lands, the links, slow fade. */
export const Outro: React.FC<{ copy: Copy5; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const k = kick(frame);
  const card = pop(frame, bar(1), 12);
  const links = rise(frame, bar(1) + beat(2), 10);
  const site = SITE_URL.replace(/^https?:\/\//, "");
  const linkedin = (D.contact.social.find((s) => s.name === "LinkedIn")?.url ?? "").replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
  const fade = interpolate(frame, [bar(4) - 36, bar(4)], [1, 0], clamp);
  const link = (icon: React.ReactNode, text: string, i: number) => (
    <span style={{ display: "flex", alignItems: "center", gap: 12, opacity: rise(frame, bar(1) + beat(2) + i * 3, 8), transform: `translateY(${(1 - rise(frame, bar(1) + beat(2) + i * 3, 8)) * 20}px)` }}>
      {icon} {text}
    </span>
  );

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: 960 - 700, top: 540 - 700, width: 1400, height: 1400, background: `radial-gradient(circle, ${P.blue}${Math.round(40 + k * 40).toString(16).padStart(2, "0")}, transparent 55%)` }} />
      <svg aria-hidden="true" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 50 }).map((_, i) => {
          const a = random(`oa${i}`) * Math.PI * 2;
          const r = 300 + ((frame * (4 + random(`os${i}`) * 8) + random(`or${i}`) * 1000) % 1000);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative
            <line key={i} x1={960 + Math.cos(a) * r} y1={540 + Math.sin(a) * r * 0.6} x2={960 + Math.cos(a) * (r + 120)} y2={540 + Math.sin(a) * (r + 120) * 0.6} stroke={[P.cyan, P.blue, P.violet][i % 3]} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
          );
        })}
      </svg>
      <Flash at={0} strength={0.7} len={10} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${card > 0 ? -120 : 0}px)`, transition: "none" }}>
        <Slam text={copy.outroLine[0]} at={2} size={170} stagger={beat(0.5)} align="center" outDir={[0, 0]} />
        <Slam text={copy.outroLine[1]} at={beat(2)} size={170} gradient={GRAD} stagger={beat(0.5)} align="center" outDir={[0, 0]} />
      </div>

      {frame >= bar(1) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, card), transform: `scale(${card})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <Img src={staticFile("avatar.jpg")} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: `3px solid ${P.fg}`, boxShadow: `0 0 0 10px ${P.blue}44` }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, color: P.fg, letterSpacing: -2, lineHeight: 1 }}>{D.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 26, color: P.cyan, marginTop: 10 }}>{t(D.headline, lang)}</div>
            </div>
          </div>
          <div style={{ marginTop: 44, display: "flex", gap: 44, fontFamily: MONO, fontSize: 28, color: P.fg, opacity: links }}>
            {link(<span style={{ color: P.cyan }}>▸</span>, site, 0)}
            {link(<MailIcon size={28} color={P.cyan} />, D.contact.email, 1)}
            {link(<LinkedInIcon width={28} height={28} style={{ color: P.cyan }} />, linkedin, 2)}
            {link(<GitHubIcon width={28} height={28} style={{ color: P.cyan }} />, "FlorianRuen", 3)}
          </div>
        </div>
      )}
    </div>
  );
};
