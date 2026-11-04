import { MailIcon } from "lucide-react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { RESUME_DATA as D } from "@/data/resume-data";
import { SITE_URL } from "@/lib/site";
import { clamp, Flash, Glitch, GradientText, popAt } from "../components";
import type { Copy } from "../copy";
import { C, MONO, SANS } from "../theme";

/** 60-66 s: final hit, call to action and contacts. No exit fade: the video ends here. */
export const Outro: React.FC<{ copy: Copy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const [l1, l2] = copy.outroTitle;
  const s1 = popAt(frame, 0, 12);
  const s2 = popAt(frame, 8, 12);
  const sub = interpolate(frame, [22, 34], [0, 1], clamp);
  const links = interpolate(frame, [36, 50], [0, 1], clamp);
  const site = SITE_URL.replace(/^https?:\/\//, "");
  const linkedin = D.contact.social.find((s) => s.name === "LinkedIn")?.url ?? "";

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Flash length={12} strength={0.8} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          paddingBottom: 40,
        }}
      >
        <Img
          src={staticFile("avatar.jpg")}
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            objectFit: "cover",
            border: `4px solid ${C.cyan}`,
            boxShadow: `0 0 50px ${C.blue}`,
            marginBottom: 36,
            opacity: Math.min(1, s1),
            transform: `scale(${s1})`,
          }}
        />
        <Glitch at={0} length={10}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 150,
              letterSpacing: -6,
              lineHeight: 0.95,
              color: C.fg,
              transform: `scale(${s1})`,
            }}
          >
            {l1}
          </div>
        </Glitch>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: -6,
            lineHeight: 1.05,
            transform: `scale(${s2})`,
            opacity: Math.min(1, Math.max(0, s2)),
          }}
        >
          <GradientText>{l2}</GradientText>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 40,
            color: C.fg,
            opacity: sub,
          }}
        >
          {D.name} <span style={{ color: C.muted }}>· {copy.outroSub}</span>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 46,
            fontFamily: MONO,
            fontSize: 30,
            color: C.fg,
            opacity: links,
            transform: `translateY(${(1 - links) * 20}px)`,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 12, color: C.cyan, fontWeight: 700 }}>
            ▸ {site}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MailIcon size={30} color={C.cyan} /> {D.contact.email}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LinkedInIcon width={30} height={30} style={{ color: C.cyan }} />
            {linkedin.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <GitHubIcon width={30} height={30} style={{ color: C.cyan }} />
            FlorianRuen
          </span>
        </div>
      </div>
    </div>
  );
};
