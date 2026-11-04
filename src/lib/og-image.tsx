import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { RESUME_DATA } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";

/** One readable line of proof points (bare numbers mean nothing without their labels). */
const FOOTER: Record<Lang, string> = {
  en: "8+ years building software · AI startup founder · Award-winning innovation",
  fr: "8+ ans à construire des logiciels · Fondateur d'une startup IA · Innovation primée",
};

export const OG_SIZE = { width: 1200, height: 630 };

/** 1200×630 preview card shown when the site is shared (LinkedIn, Slack, X…). Built at deploy time. */
export async function renderOgImage(lang: Lang) {
  const avatar = await readFile(join(process.cwd(), "public/avatar.jpg"));
  const avatarSrc = `data:image/jpeg;base64,${avatar.toString("base64")}`;
  const current = RESUME_DATA.work[0];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "linear-gradient(135deg, #111827 0%, #16213a 100%)",
        color: "#f1f5f9",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#61a6fa", letterSpacing: 1 }}>
        ~/{RESUME_DATA.name.toLowerCase().replace(" ", "-")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        {/* biome-ignore lint/performance/noImgElement: next/og renders plain <img>, next/image is not available here */}
        <img
          src={avatarSrc}
          alt=""
          width={220}
          height={220}
          style={{ borderRadius: 32, border: "2px solid #2a3a57" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1 }}>{RESUME_DATA.name}</div>
          <div style={{ fontSize: 38, color: "#61a6fa" }}>{t(RESUME_DATA.headline, lang)}</div>
          <div style={{ fontSize: 26, color: "#a2b0c3", maxWidth: 720 }}>{t(RESUME_DATA.tagline, lang)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a2b0c3" }}>
        <span>{FOOTER[lang]}</span>
        <span style={{ color: "#f1f5f9" }}>{current.company}</span>
      </div>
    </div>,
    OG_SIZE,
  );
}
