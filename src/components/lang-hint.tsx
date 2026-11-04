"use client";

import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { LANG_PATH, type Lang } from "@/lib/i18n";

const DISMISS_KEY = "lang-hint-dismissed";

const MESSAGE: Record<Lang, { text: string; action: string; close: string }> = {
  // Shown on the English page to French-speaking visitors (so written in French).
  fr: { text: "Ce CV est aussi disponible en français.", action: "Voir en français", close: "Fermer" },
  // Shown on the French page to everyone else (so written in English).
  en: { text: "This resume is also available in English.", action: "View in English", close: "Close" },
};

/**
 * Suggests the other language when the browser prefers it. Never redirects,
 * so search engines and shared links always get the page they asked for.
 */
export function LangHint({ lang }: { lang: Lang }) {
  const [suggest, setSuggest] = useState<Lang | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // Storage unavailable: still show the hint, it just won't be remembered.
    }
    const prefersFrench = navigator.languages.some((l) => l.toLowerCase().startsWith("fr"));
    const other: Lang = lang === "en" ? "fr" : "en";
    if ((other === "fr") === prefersFrench) setSuggest(other);
  }, [lang]);

  if (!suggest) return null;

  const dismiss = () => {
    setSuggest(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore: the hint simply comes back next visit.
    }
  };

  const msg = MESSAGE[suggest];
  return (
    <div lang={suggest} className="slide-down border-b border-border/60 bg-primary/5 print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
        <p className="text-muted-foreground">
          {msg.text}{" "}
          <a href={LANG_PATH[suggest]} hrefLang={suggest} className="font-medium text-primary hover:underline">
            {msg.action} →
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={msg.close}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
