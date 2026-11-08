import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserPlusIcon,
  ArrowUpRightIcon,
  CodeIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { CareerChart } from "@/components/career-chart";
import { CommandPalette } from "@/components/command-palette";
import { ConsoleGreeting, SOURCE_URL } from "@/components/console-greeting";
import { CopyButton } from "@/components/copy-button";
import { LangHint } from "@/components/lang-hint";
import { PrintButton } from "@/components/print-button";
import { PrintResume } from "@/components/print-resume";
import { ThemeToggle } from "@/components/theme-toggle";
import { VideoButton } from "@/components/video-button";
import { EUROPE1_PEAKS } from "@/data/europe1-peaks";
import { RESUME_DATA } from "@/data/resume-data";
import {
  LANG_PATH,
  UI,
  formatDate,
  formatMonth,
  t,
  type Lang,
} from "@/lib/i18n";
import { BUILD_DATE, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const D = RESUME_DATA;

/** Where the Europe 1 MP3 is hosted (kept out of the repo). Unset = no player. */
const AUDIO_URL = process.env.NEXT_PUBLIC_EUROPE1_AUDIO_URL;

function SectionTitle({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase print:mb-3">
      <span className="text-primary">{String(index).padStart(2, "0")}</span>
      {children}
      <span className="h-px flex-1 bg-border" aria-hidden />
    </h2>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="border-border bg-muted/40 text-[11px] font-normal text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary print:px-1.5 print:py-0 print:text-[9px]"
    >
      {children}
    </Badge>
  );
}

/** Staggered entrance: order `i` sets the animation delay (see .enter in globals.css). */
const enter = (i: number) => ({
  className: "enter",
  style: { "--i": i } as React.CSSProperties,
});

function prettyPhone(tel: string) {
  // +33610556771 -> +33 6 10 55 67 71
  return tel.replace(
    /^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "+33 $1 $2 $3 $4 $5",
  );
}

export function Resume({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const otherLang: Lang = lang === "fr" ? "en" : "fr";
  const currentJob = D.work[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: D.name,
    jobTitle: t(currentJob.roles[0].title, lang),
    worksFor: {
      "@type": "Organization",
      name: currentJob.company,
      url: currentJob.link,
    },
    email: `mailto:${D.contact.email}`,
    image: `${SITE_URL}${D.avatarUrl}`,
    url: `${SITE_URL}${LANG_PATH[lang]}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Paris",
      addressCountry: "FR",
    },
    sameAs: D.contact.social.map((s) => s.url),
    alumniOf: [{ "@type": "CollegeOrUniversity", name: "Polytech Sorbonne" }],
    knowsLanguage: ["fr", "en"],
    knowsAbout: D.skills
      .filter((group) => group.category.en !== "Soft skills")
      .flatMap((group) => group.items.map((item) => t(item, lang))),
  };

  return (
    <>
      <div className="site min-h-screen bg-background">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from our own data; "<" is escaped
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <LangHint lang={lang} />

        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur print:hidden">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
            <a
              href={LANG_PATH[lang]}
              className="font-mono text-sm font-semibold tracking-tight"
            >
              <span className="text-primary">~/</span>
              {D.name.toLowerCase().replace(" ", "-")}
            </a>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs"
                asChild
              >
                <a
                  href={LANG_PATH[otherLang]}
                  hrefLang={otherLang}
                  aria-label={ui.switchLangLabel}
                >
                  {otherLang.toUpperCase()}
                </a>
              </Button>
              <CommandPalette lang={lang} />
              <ThemeToggle label={ui.toggleTheme} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 print:space-y-8 print:p-0">
          {/* Hero */}
          <section className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-start print:justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 {...enter(0)}>
                  <span className="block text-4xl font-semibold tracking-tight sm:text-5xl print:text-3xl">
                    {D.name}
                  </span>
                </h1>
                <p {...enter(1)}>
                  <span className="block text-lg font-medium text-primary">
                    {t(D.headline, lang)}
                  </span>
                </p>
              </div>
              <div {...enter(2)}>
                <p className="max-w-xl text-pretty text-muted-foreground">
                  {t(D.tagline, lang)}
                </p>
              </div>

              <ul
                {...enter(3)}
                className="enter flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground"
              >
                <li>
                  <a
                    href={D.locationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <MapPinIcon className="size-3.5" />
                    {t(D.location, lang)}
                  </a>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <a
                    href={`mailto:${D.contact.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <MailIcon className="size-3.5" />
                    {D.contact.email}
                  </a>
                  <CopyButton
                    value={D.contact.email}
                    label={ui.copyEmail}
                    copiedLabel={ui.copied}
                  />
                  <a
                    href="/vcard.vcf"
                    aria-label={ui.saveContact}
                    title={ui.saveContact}
                    className="-m-1 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden"
                  >
                    <UserPlusIcon className="size-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${D.contact.tel}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <PhoneIcon className="size-3.5" />
                    {prettyPhone(D.contact.tel)}
                  </a>
                </li>
                {D.contact.social.map((social) => (
                  <li key={social.name} className="hidden print:list-item">
                    <a
                      href={social.url}
                      className="inline-flex items-center gap-1.5"
                    >
                      <social.icon className="size-3.5" />
                      {social.url
                        .replace(/^https:\/\/(www\.)?/, "")
                        .replace(/\/$/, "")}
                    </a>
                  </li>
                ))}
              </ul>

              <div
                {...enter(4)}
                className="enter flex flex-wrap items-center gap-2 pt-1 print:hidden"
              >
                <PrintButton label={ui.downloadPdf} lang={lang} />
                <VideoButton
                  lang={lang}
                  label={ui.watchVideo}
                  closeLabel={ui.closeVideo}
                />
                {D.contact.social.map((social) => (
                  <Button key={social.name} variant="outline" size="sm" asChild>
                    <a href={social.url} target="_blank" rel="noreferrer">
                      <social.icon className="mr-2 size-4" />
                      {social.name}
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <Avatar
              {...enter(1)}
              className="enter size-24 shrink-0 rounded-2xl ring-1 ring-border sm:size-28 print:size-20"
            >
              <AvatarImage
                alt={D.name}
                src={D.avatarUrl}
                className="rounded-2xl"
              />
              <AvatarFallback className="rounded-2xl">
                {D.initials}
              </AvatarFallback>
            </Avatar>
          </section>

          {/* Highlights: career figures, then what the products I built handle */}
          <section
            aria-label="Highlights"
            {...enter(5)}
            className="enter space-y-3"
          >
            {(
              [
                ["career", ui.figuresCareer],
                ["product", ui.figuresProduct],
              ] as const
            ).map(([group, title]) => (
              <div key={group}>
                <h2 className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  {title}
                </h2>
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 print:grid-cols-3">
                  {D.highlights
                    .filter((h) => h.group === group)
                    .map((h) => (
                      <div
                        key={h.label.en}
                        className="bg-card p-5 print:px-3 print:py-2"
                      >
                        <div
                          className={cn(
                            "text-2xl font-semibold tracking-tight print:text-base",
                            group === "product" && "text-primary",
                          )}
                        >
                          {t(h.value, lang)}
                        </div>
                        <div className="mt-1 text-sm text-pretty text-muted-foreground">
                          {t(h.label, lang)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </section>

          {/* Career timeline chart */}
          <section {...enter(6)} className="enter -mt-8 print:hidden">
            <CareerChart lang={lang} />
          </section>

          {/* About */}
          <section id="about" className="reveal scroll-mt-20">
            <SectionTitle index={1}>{ui.about}</SectionTitle>
            <p className="leading-relaxed text-pretty text-muted-foreground">
              {t(D.summary, lang)}
            </p>
          </section>

          {/* Experience */}
          <section id="experience" className="reveal scroll-mt-20">
            <SectionTitle index={2}>{ui.experience}</SectionTitle>
            <ol className="timeline relative ml-1.5 space-y-10 border-l border-border pl-6 print:space-y-5">
              {D.work.map((job, jobIndex) => {
                const isCurrent = job.roles[0].end === null;
                return (
                  <li key={job.company} className="relative break-inside-avoid">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1.5 -left-[30.5px] z-1 size-3 rounded-full ring-4 ring-background",
                        isCurrent ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    <h3 className="text-lg leading-none font-semibold">
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1 hover:text-primary"
                      >
                        {job.company}
                        <ArrowUpRightIcon className="size-4 -translate-x-1 translate-y-1 opacity-0 transition duration-200 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 print:hidden" />
                      </a>
                    </h3>

                    {"summary" in job && (
                      <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-pretty text-muted-foreground print:border-0 print:bg-transparent print:p-0">
                        <span className="font-medium text-foreground">
                          {ui.product} ·{" "}
                        </span>
                        {t(job.summary, lang)}
                      </p>
                    )}

                    <div className="mt-3 space-y-5">
                      {job.roles.map((role) => (
                        <div key={role.title.en}>
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                            <h4 className="font-medium">
                              {t(role.title, lang)}
                              {role.end === null && jobIndex === 0 && (
                                <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 align-middle font-mono text-[10px] font-normal text-primary print:hidden">
                                  <span className="pulse-dot size-1.5 rounded-full bg-primary" />
                                  {ui.currently}
                                </span>
                              )}
                            </h4>
                            <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                              {formatDate(role.start, lang)} —{" "}
                              {formatDate(role.end, lang)}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                            {role.bullets.map((b) => (
                              <li key={b.en} className="flex gap-2 text-pretty">
                                <span
                                  aria-hidden
                                  className="text-primary select-none"
                                >
                                  ▹
                                </span>
                                <span>{t(b, lang)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.tech.map((tech) => (
                        <Chip key={tech}>{tech}</Chip>
                      ))}
                    </div>

                    {"audio" in job && AUDIO_URL && (
                      <AudioPlayer
                        src={AUDIO_URL}
                        peaks={EUROPE1_PEAKS}
                        durationSec={job.audio.durationSec}
                        title={job.audio.title}
                        dateLabel={new Intl.DateTimeFormat(
                          lang === "fr" ? "fr-FR" : "en-GB",
                          { dateStyle: "long", timeZone: "UTC" },
                        ).format(new Date(job.audio.date))}
                        copyright={job.audio.copyright}
                        sourceUrl={job.audio.sourceUrl}
                        labels={{
                          listen: ui.listen,
                          pause: ui.pause,
                          seek: ui.seek,
                          originalPage: ui.originalPage,
                        }}
                      />
                    )}

                    {"press" in job && (
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                          {t(job.press.label, lang)}
                        </span>
                        {job.press.items.map((item) =>
                          item.url ? (
                            <a
                              key={item.name}
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-foreground/80 underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                            >
                              {item.name}
                            </a>
                          ) : (
                            <span
                              key={item.name}
                              className="text-foreground/80"
                            >
                              {item.name}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Skills */}
          <section
            id="skills"
            className="reveal scroll-mt-20 break-inside-avoid"
          >
            <SectionTitle index={3}>{ui.skills}</SectionTitle>
            <dl className="space-y-4 print:space-y-2">
              {D.skills.map((group) => (
                <div
                  key={group.category.en}
                  className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="text-sm font-medium">
                    {t(group.category, lang)}
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => {
                      const label = t(item, lang);
                      return <Chip key={label}>{label}</Chip>;
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Education */}
          <section
            id="education"
            className="reveal scroll-mt-20 break-inside-avoid"
          >
            <SectionTitle index={4}>{ui.education}</SectionTitle>
            <ul className="space-y-4">
              {D.education.map((edu) => (
                <li
                  key={edu.degree.en}
                  className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div>
                    <div className="font-medium">{edu.school}</div>
                    <div className="text-sm text-muted-foreground">
                      {t(edu.degree, lang)}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    {edu.start} — {edu.end}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Projects */}
          <section
            id="projects"
            className="reveal scroll-mt-20 break-inside-avoid"
          >
            <SectionTitle index={5}>{ui.projects}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              {D.projects.map((project) => (
                <div
                  key={project.title}
                  className="flex flex-col rounded-xl border border-border bg-card p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:hover:translate-y-0"
                >
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                    {t(project.description, lang)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Chip key={tag.en}>{t(tag, lang)}</Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section
            id="interests"
            className="reveal scroll-mt-20 break-inside-avoid"
          >
            <SectionTitle index={6}>{ui.interests}</SectionTitle>
            <ul className="flex flex-wrap gap-2">
              {D.interests.map((item) => (
                <li key={item.en}>
                  <Chip>{t(item, lang)}</Chip>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer className="border-t border-border/60 print:hidden">
          <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-6 font-mono text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
            <span>
              © {BUILD_DATE.getFullYear()} {D.name} · {ui.lastUpdated}{" "}
              {formatMonth(BUILD_DATE, lang)}
            </span>
            <nav
              aria-label={ui.machineReadable}
              className="flex flex-wrap items-center gap-x-3 gap-y-1"
            >
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <CodeIcon className="size-3.5" />
                {ui.viewSource}
              </a>
              <span aria-hidden className="text-border">
                |
              </span>
              <a
                href="/resume.json"
                className="transition-colors hover:text-primary"
                title="JSON Resume"
              >
                {"{ }"} JSON
              </a>
              <a
                href={lang === "fr" ? "/cv-fr" : "/cv"}
                className="transition-colors hover:text-primary"
                title={`curl ${SITE_URL}${lang === "fr" ? "/cv-fr" : "/cv"}`}
              >
                $ curl
              </a>
              <a
                href="/llms.txt"
                className="transition-colors hover:text-primary"
                title={
                  lang === "fr"
                    ? "Mon CV pour les assistants IA"
                    : "My resume for AI assistants"
                }
              >
                llms.txt
              </a>
            </nav>
          </div>
        </footer>
        <ConsoleGreeting />
      </div>

      <PrintResume lang={lang} />
    </>
  );
}
