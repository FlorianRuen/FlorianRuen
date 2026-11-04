"use client";

import { DownloadIcon } from "lucide-react";
import { useEffect } from "react";
import { RESUME_DATA } from "@/data/resume-data";
import type { Lang } from "@/lib/i18n";
import { Button } from "./ui/button";

/**
 * "Download PDF" = the browser's "Save as PDF" on a dedicated print layout
 * (see the print styles in globals.css), so the PDF is always the live content.
 *
 * While printing - from this button or Ctrl/Cmd+P - the page is forced to the
 * light theme and the document title becomes the suggested file name
 * ("Florian-Ruen-CV-EN.pdf"); both are restored afterwards.
 */
export function PrintButton({ label, lang }: { label: string; lang: Lang }) {
  useEffect(() => {
    const root = document.documentElement;
    let wasDark = false;
    let previousTitle = "";

    const before = () => {
      wasDark = root.classList.contains("dark");
      root.classList.remove("dark");
      previousTitle = document.title;
      document.title = `${RESUME_DATA.name.replace(/\s+/g, "-")}-CV-${lang.toUpperCase()}`;
    };
    const after = () => {
      if (wasDark) root.classList.add("dark");
      if (previousTitle) document.title = previousTitle;
    };

    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [lang]);

  return (
    <Button size="sm" onClick={() => window.print()}>
      <DownloadIcon className="mr-2 size-4" />
      {label}
    </Button>
  );
}
