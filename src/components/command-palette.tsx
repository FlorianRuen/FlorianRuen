"use client";

import {
  BracesIcon,
  BotIcon,
  CodeIcon,
  CommandIcon,
  CopyIcon,
  CornerDownLeftIcon,
  DownloadIcon,
  HashIcon,
  LanguagesIcon,
  MailIcon,
  SearchIcon,
  SunMoonIcon,
  TerminalIcon,
  UserPlusIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SOURCE_URL } from "@/components/console-greeting";
import { toggleTheme } from "@/components/theme-toggle";
import { RESUME_DATA } from "@/data/resume-data";
import { LANG_PATH, UI, formatDate, t, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * ⌘K / Ctrl+K command palette: jump to a section, run an action, or type a
 * terminal command (`help`, `whoami`, `sudo hire florian`…). Built on the
 * native <dialog> element, so Esc, focus trapping and the backdrop are free.
 */

const D = RESUME_DATA;

type Item = {
  id: string;
  group: "goTo" | "actions" | "terminal";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Extra words that match the search, beyond the label. */
  keywords?: string;
  run: () => void;
};

type Line = { kind: "in" | "out"; text: string };

const SECTIONS = [
  "about",
  "experience",
  "skills",
  "education",
  "projects",
  "interests",
] as const;

/* -------------------------------------------------------- terminal -- */

const COMMANDS = [
  "help",
  "whoami",
  "experience",
  "skills",
  "contact",
  "sudo hire florian",
  "clear",
  "exit",
] as const;

function runCommand(raw: string, lang: Lang): string[] | "clear" | "exit" {
  const fr = lang === "fr";
  const cmd = raw.trim().replace(/\s+/g, " ").toLowerCase();

  switch (cmd) {
    case "help":
      return [
        fr ? "Commandes disponibles :" : "Available commands:",
        `  whoami             ${fr ? "qui suis-je" : "who I am"}`,
        `  experience         ${fr ? "parcours" : "career"}`,
        `  skills             ${fr ? "compétences" : "skills"}`,
        `  contact            ${fr ? "me joindre" : "get in touch"}`,
        `  sudo hire florian  ${fr ? "à vos risques" : "at your own risk"}`,
        "  clear | exit",
      ];
    case "whoami":
      return [
        `${D.name} – ${t(D.headline, lang)}`,
        t(D.tagline, lang),
        `📍 ${t(D.location, lang)}`,
      ];
    case "experience":
    case "cat experience":
      return D.work.flatMap((w) =>
        w.roles.map(
          (r) =>
            `${`${formatDate(r.start, lang)} – ${formatDate(r.end, lang)}`.padEnd(22)}${t(r.title, lang)} @ ${w.company}`,
        ),
      );
    case "skills":
    case "cat skills":
      return D.skills.map(
        (g) =>
          `${t(g.category, lang).padEnd(18)}${g.items.map((i) => t(i, lang)).join(", ")}`,
      );
    case "contact":
      return [
        `email     ${D.contact.email}`,
        ...D.contact.social.map(
          (s) => `${s.name.toLowerCase().padEnd(10)}${s.url}`,
        ),
        `vcard     ${typeof window === "undefined" ? "" : window.location.origin}/vcard.vcf`,
      ];
    case "sudo hire florian":
    case "sudo hire":
      return [
        "[sudo] password for recruiter: ********",
        fr
          ? "✔ Accès accordé. Prochaine étape : un e-mail à"
          : "✔ Access granted. Next step: an email to",
        `  ${D.contact.email}`,
      ];
    case "hire florian":
      return [
        fr
          ? "Permission refusée. Essayez avec sudo 😉"
          : "Permission denied. Try with sudo 😉",
      ];
    case "ls":
      return [SECTIONS.join("  ")];
    case "pwd":
      return [`/home/${D.name.toLowerCase().replace(" ", "-")}`];
    case "clear":
      return "clear";
    case "exit":
      return "exit";
    case "":
      return [];
    default:
      return [
        `${cmd.split(" ")[0]}: ${fr ? "commande introuvable" : "command not found"}. ${fr ? "Tapez" : "Type"} help.`,
      ];
  }
}

/* --------------------------------------------------------- palette -- */

export function CommandPalette({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [mac, setMac] = useState(true);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Global shortcut: ⌘K / Ctrl+K toggles, "/" opens when not typing elsewhere.
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  /** Close first, then act, so scrolling and printing see the page, not the dialog. */
  const then = useCallback(
    (action: () => void) => () => {
      close();
      requestAnimationFrame(action);
    },
    [close],
  );

  const items: Item[] = useMemo(() => {
    const otherLang: Lang = lang === "fr" ? "en" : "fr";
    const section = (id: (typeof SECTIONS)[number]): Item => ({
      id: `go-${id}`,
      group: "goTo",
      label: ui[id],
      icon: HashIcon,
      keywords: id,
      run: then(() => {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        history.replaceState(null, "", `#${id}`);
      }),
    });
    return [
      ...SECTIONS.map(section),
      {
        id: "copy-email",
        group: "actions",
        label: ui.copyEmail,
        icon: CopyIcon,
        keywords: "email mail clipboard",
        run: then(() => {
          navigator.clipboard?.writeText(D.contact.email).catch(() => {});
        }),
      },
      {
        id: "send-email",
        group: "actions",
        label: ui.sendEmail,
        icon: MailIcon,
        keywords: "email mail contact",
        run: then(() => {
          window.location.href = `mailto:${D.contact.email}`;
        }),
      },
      {
        id: "vcard",
        group: "actions",
        label: ui.saveContact,
        icon: UserPlusIcon,
        keywords: "vcard vcf contact phone",
        run: then(() => {
          window.location.href = "/vcard.vcf";
        }),
      },
      {
        id: "pdf",
        group: "actions",
        label: ui.downloadPdf,
        icon: DownloadIcon,
        keywords: "pdf print cv resume",
        run: then(() => window.print()),
      },
      {
        id: "theme",
        group: "actions",
        label: ui.toggleTheme,
        icon: SunMoonIcon,
        keywords: "dark light theme mode",
        run: then(toggleTheme),
      },
      {
        id: "lang",
        group: "actions",
        label: ui.switchLangLabel,
        icon: LanguagesIcon,
        keywords: "language langue english français",
        run: then(() => {
          window.location.href = LANG_PATH[otherLang];
        }),
      },
      {
        id: "source",
        group: "actions",
        label: ui.viewSource,
        icon: CodeIcon,
        keywords: "github code source",
        run: then(() => window.open(SOURCE_URL, "_blank", "noopener")),
      },
      {
        id: "json",
        group: "actions",
        label: "JSON Resume",
        icon: BracesIcon,
        keywords: "json api machine",
        run: then(() => window.open("/resume.json", "_blank", "noopener")),
      },
      {
        id: "llms",
        group: "actions",
        label: "llms.txt",
        icon: BotIcon,
        keywords: "ai llm chatgpt claude",
        run: then(() => window.open("/llms.txt", "_blank", "noopener")),
      },
    ];
  }, [lang, ui, then]);

  /** A query that looks like a command switches the palette to terminal mode. */
  const isCommand = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (
      q.length > 0 &&
      (q.startsWith("sudo") ||
        q.startsWith("cat ") ||
        ["ls", "pwd", "whoami", "help", "clear", "exit", "contact"].includes(
          q,
        ) ||
        COMMANDS.some((c) => c === q))
    );
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  const execute = (command: string) => {
    const out = runCommand(command, lang);
    if (out === "exit") {
      setLines([]);
      close();
    } else if (out === "clear") {
      setLines([]);
    } else {
      setLines((prev) => [
        ...prev,
        { kind: "in", text: command.trim() },
        ...out.map((text) => ({ kind: "out" as const, text })),
      ]);
    }
    setQuery("");
    setActive(0);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = results.length;
      if (!n) return;
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isCommand || !results.length) execute(query);
      else results[active]?.run();
    }
  };

  // Keep the highlighted row in view while navigating with the keyboard.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // Terminal mode: follow the latest output, like a real shell.
  useEffect(() => {
    if (lines.length && listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [lines]);

  const groups = (["goTo", "actions"] as const).filter((g) =>
    results.some((r) => r.group === g),
  );

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={ui.paletteHint}
        title={ui.paletteHint}
        className="hidden h-8 items-center gap-1 rounded-md border border-border px-2 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
      >
        {mac ? <CommandIcon className="size-3" /> : <span>Ctrl</span>}K
      </button>
      <button
        type="button"
        onClick={open}
        aria-label={ui.paletteHint}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
      >
        <TerminalIcon className="size-4" />
      </button>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Esc already closes a native dialog; the click only handles the backdrop */}
      <dialog
        ref={dialogRef}
        aria-label={ui.commandPalette}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="palette m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl shadow-black/20 backdrop:bg-background/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          {isCommand ? (
            <span className="font-mono text-sm text-primary">$</span>
          ) : (
            <SearchIcon className="size-4 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder={ui.palettePlaceholder}
            aria-label={ui.palettePlaceholder}
            spellCheck={false}
            autoComplete="off"
            className={cn(
              "h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
              isCommand && "font-mono",
            )}
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          className="max-h-[min(24rem,60vh)] overflow-y-auto p-2"
        >
          {lines.length > 0 && (
            <pre
              aria-live="polite"
              className="mb-2 overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap"
            >
              {lines.map((line, i) =>
                line.kind === "in" ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: append-only log, lines never move
                  <div key={i} className="text-primary">
                    $ {line.text}
                  </div>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: append-only log, lines never move
                  <div key={i} className="text-muted-foreground">
                    {line.text}
                  </div>
                ),
              )}
            </pre>
          )}

          {isCommand || (query && !results.length) ? (
            <button
              type="button"
              onClick={() => execute(query)}
              className="flex w-full items-center gap-3 rounded-lg bg-muted px-3 py-2 text-left font-mono text-sm"
            >
              <TerminalIcon className="size-4 text-primary" />
              <span className="flex-1">{query}</span>
              <span className="text-[11px] text-muted-foreground">
                {ui.run}
              </span>
              <CornerDownLeftIcon className="size-3.5 text-muted-foreground" />
            </button>
          ) : lines.length > 0 && !query ? null : (
            groups.map((group) => (
              <fieldset key={group} className="m-0 border-0 p-0">
                <legend className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                  {ui[group]}
                </legend>
                {results.map((item, index) =>
                  item.group !== group ? null : (
                    <button
                      key={item.id}
                      type="button"
                      data-index={index}
                      onClick={item.run}
                      onMouseMove={() => setActive(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        index === active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {index === active && (
                        <CornerDownLeftIcon className="size-3.5" />
                      )}
                    </button>
                  ),
                )}
              </fieldset>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
          <span>{ui.paletteFooter}</span>
          <span className="hidden sm:inline">↑↓ ↵</span>
        </div>
      </dialog>
    </>
  );
}
