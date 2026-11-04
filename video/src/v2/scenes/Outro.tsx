import { MailIcon } from "lucide-react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { clamp, Glitch, GradientText, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy2 } from "../copy";
import { K } from "../theme";

/** Bars 32-36: the IDE flies away and the contact card lands. */
export const Outro: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const card = popAt(frame, 14, 14);
  const l1 = popAt(frame, 22, 12);
  const l2 = popAt(frame, 30, 12);
  const links = interpolate(frame, [44, 58], [0, 1], clamp);
  const site = SITE_URL.replace(/^https?:\/\//, "");
  const linkedin = (D.contact.social.find((s) => s.name === "LinkedIn")?.url ?? "").replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        perspective: 1600,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, Math.max(0, card)), transform: `rotateX(${(1 - card) * 50}deg) scale(${card})` }}>
        <Img
          src={staticFile("avatar.jpg")}
          style={{ width: 130, height: 130, borderRadius: "50%", objectFit: "cover", border: `4px solid ${K.cyan}`, boxShadow: `0 0 50px ${K.blue}` }}
        />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: K.fg, letterSpacing: -2 }}>{D.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 28, color: K.blue }}>{t(D.headline, lang)}</div>
        </div>
      </div>

      <Glitch at={22} length={10} style={{ marginTop: 50 }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: -5, lineHeight: 1, color: K.fg, transform: `scale(${l1})`, opacity: Math.min(1, Math.max(0, l1)) }}>
          {copy.outroLine[0]}
        </div>
      </Glitch>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: -5, lineHeight: 1.15, transform: `scale(${l2})`, opacity: Math.min(1, Math.max(0, l2)) }}>
        <GradientText>{copy.outroLine[1]}</GradientText>
      </div>

      <div
        style={{
          marginTop: 46,
          display: "flex",
          gap: 44,
          fontFamily: MONO,
          fontSize: 28,
          color: K.fg,
          opacity: links,
          transform: `translateY(${(1 - links) * 20}px)`,
        }}
      >
        <span style={{ color: K.cyan, fontWeight: 700 }}>▸ {site}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MailIcon size={28} color={K.cyan} /> {D.contact.email}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LinkedInIcon width={28} height={28} style={{ color: K.cyan }} /> {linkedin}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GitHubIcon width={28} height={28} style={{ color: K.cyan }} /> FlorianRuen
        </span>
      </div>
    </div>
  );
};
