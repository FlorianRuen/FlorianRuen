"use client";

import { useEffect } from "react";
import { RESUME_DATA } from "@/data/resume-data";
import { SITE_URL } from "@/lib/site";

export const SOURCE_URL = "https://github.com/FlorianRuen/FlorianRuen";

let greeted = false;

/** A short note in the browser console, for the curious who open DevTools. */
export function ConsoleGreeting() {
  useEffect(() => {
    if (greeted) return;
    greeted = true;
    const title = "font: 600 14px/1.6 system-ui, sans-serif; color: #3b82f6";
    const body = "font: 12px/1.6 ui-monospace, monospace";
    const code = "font: 12px/1.6 ui-monospace, monospace; color: #3b82f6";
    console.info(
      `%c👋 Hi there, curious developer!%c

Like what you see? Let's talk → %c${RESUME_DATA.contact.email}%c

  Source of this site   %c${SOURCE_URL}%c
  Resume as plain text  %ccurl ${SITE_URL.replace(/^https?:\/\//, "")}/cv%c
  JSON Resume           %c${SITE_URL}/resume.json`,
      title,
      body,
      code,
      body,
      code,
      body,
      code,
      body,
      code,
    );
  }, []);

  return null;
}
