"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Inline script run before paint: applies the saved theme, or the system
 * preference, so the page never flashes the wrong colours.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function applyToggle() {
  const isDark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    // Storage unavailable (private mode): the toggle still works for this visit.
  }
}

export function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Cross-fade the whole page where the View Transitions API exists; instant otherwise.
    if (!reduceMotion && document.startViewTransition) {
      document.startViewTransition(applyToggle);
    } else {
      applyToggle();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {/* Both icons are rendered; CSS picks one, so server and client markup match.
          The visible one plays .theme-icon's turn-in animation when it appears. */}
      <SunIcon className="theme-icon hidden size-4 dark:block" />
      <MoonIcon className="theme-icon size-4 dark:hidden" />
    </Button>
  );
}
