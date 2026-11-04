import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/components/theme-toggle";
import { RESUME_DATA } from "@/data/resume-data";
import { LANG_PATH, t, type Lang } from "@/lib/i18n";

import "@/app/globals.css";

const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-jetbrains-mono" });

// Vercel sets this at build time; fall back to localhost for local builds.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export function buildMetadata(lang: Lang): Metadata {
  const title = `${RESUME_DATA.name} · ${t(RESUME_DATA.headline, lang)}`;
  const description = t(RESUME_DATA.tagline, lang);
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: LANG_PATH[lang],
      languages: { fr: LANG_PATH.fr, en: LANG_PATH.en },
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: LANG_PATH[lang],
      locale: lang === "fr" ? "fr_FR" : "en_US",
      images: [{ url: RESUME_DATA.avatarUrl, width: 460, height: 460, alt: RESUME_DATA.name }],
    },
    twitter: { card: "summary", title, description, images: [RESUME_DATA.avatarUrl] },
  };
}

export function RootLayout({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      {/* biome-ignore lint/style/noHeadElement: <head> is valid in an App Router root layout */}
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: constant script, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
