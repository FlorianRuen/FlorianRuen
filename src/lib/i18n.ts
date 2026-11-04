import type { Localized } from "@/data/resume-data";

export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_PATH: Record<Lang, string> = { en: "/", fr: "/fr" };

/** Resolve a value that is either a plain string or a {fr, en} pair. */
export function t(value: string | Localized, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}

/** Format "YYYY" or "YYYY-MM" for display; `null` means "present". */
export function formatDate(value: string | null, lang: Lang): string {
  if (value === null) return UI[lang].present;
  const [year, month] = value.split("-");
  if (!month) return year;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const UI = {
  fr: {
    present: "Aujourd'hui",
    currently: "Actuellement",
    about: "À propos",
    experience: "Expérience",
    skills: "Compétences",
    education: "Formation",
    projects: "Projets & bénévolat",
    downloadPdf: "Télécharger en PDF",
    switchLang: "English",
    switchLangLabel: "View in English",
    toggleTheme: "Changer de thème",
    footer: "Construit avec Next.js & Tailwind CSS. Hébergé sur Vercel.",
  },
  en: {
    present: "Present",
    currently: "Currently",
    about: "About",
    experience: "Experience",
    skills: "Skills",
    education: "Education",
    projects: "Projects & volunteering",
    downloadPdf: "Download PDF",
    switchLang: "Français",
    switchLangLabel: "Voir en français",
    toggleTheme: "Toggle theme",
    footer: "Built with Next.js & Tailwind CSS. Hosted on Vercel.",
  },
} as const satisfies Record<Lang, Record<string, string>>;
