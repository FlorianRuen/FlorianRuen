import { MailIcon } from "lucide-react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy4 } from "../copy";
import { bar, beat, GRAD, P } from "../theme";
import { Hit, rise, Words } from "../ui";

/** Bars 29-32: the contact card, the closing line, the links, then a slow fade. */
export const Outro: React.FC<{ copy: Copy4; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const card = popAt(frame, 8, 16);
  const links = rise(frame, beat(5), 16);
  const site = SITE_URL.replace(/^https?:\/\//, "");
  const linkedin = (D.contact.social.find((s) => s.name === "LinkedIn")?.url ?? "").replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
  const fade = interpolate(frame, [bar(3) - 30, bar(3)], [1, 0], clamp);
  const link = (icon: React.ReactNode, text: string, i: number) => (
    <span style={{ display: "flex", alignItems: "center", gap: 12, opacity: rise(frame, beat(5) + i * 4, 12) }}>
      {icon} {text}
    </span>
  );

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: fade }}>
      <Hit at={0} strength={0.25} />
      <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: Math.min(1, Math.max(0, card)), transform: `scale(${Math.max(0, card)})` }}>
        <Img src={staticFile("avatar.jpg")} style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: `3px solid ${P.fg}`, boxShadow: `0 0 0 10px ${P.blue}33, 0 30px 80px rgba(0,0,0,0.6)` }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 66, color: P.fg, letterSpacing: -2, lineHeight: 1 }}>{D.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 27, color: P.cyan, marginTop: 12 }}>{t(D.headline, lang)}</div>
        </div>
      </div>

      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Words text={copy.outroLine[0]} at={beat(1.5)} size={130} stagger={4} style={{ justifyContent: "center" }} />
        <Words text={copy.outroLine[1]} at={beat(2.5)} size={130} gradient={GRAD} stagger={4} style={{ justifyContent: "center" }} />
      </div>

      <div style={{ marginTop: 60, display: "flex", gap: 48, fontFamily: MONO, fontSize: 28, color: P.fg, opacity: links, transform: `translateY(${(1 - links) * 20}px)` }}>
        {link(<span style={{ color: P.cyan }}>▸</span>, site, 0)}
        {link(<MailIcon size={28} color={P.cyan} />, D.contact.email, 1)}
        {link(<LinkedInIcon width={28} height={28} style={{ color: P.cyan }} />, linkedin, 2)}
        {link(<GitHubIcon width={28} height={28} style={{ color: P.cyan }} />, "FlorianRuen", 3)}
      </div>
    </div>
  );
};
