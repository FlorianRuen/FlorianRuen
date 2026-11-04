import { MailIcon, MapPinIcon, PhoneIcon, ArrowUpRightIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RESUME_DATA } from "@/data/resume-data";
import { LANG_PATH, UI, formatDate, t, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const D = RESUME_DATA;

function SectionTitle({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground print:mb-3">
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
      className="border-border bg-muted/40 font-normal text-[11px] text-muted-foreground"
    >
      {children}
    </Badge>
  );
}

function prettyPhone(tel: string) {
  // +33610556771 -> +33 6 10 55 67 71
  return tel.replace(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "+33 $1 $2 $3 $4 $5");
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
    worksFor: { "@type": "Organization", name: currentJob.company, url: currentJob.link },
    email: `mailto:${D.contact.email}`,
    image: D.avatarUrl,
    address: { "@type": "PostalAddress", addressLocality: "Orléans", addressCountry: "FR" },
    sameAs: D.contact.social.map((s) => s.url),
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from our own data; "<" is escaped
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <a href={LANG_PATH[lang]} className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">~/</span>
            {D.name.toLowerCase().replace(" ", "-")}
          </a>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="font-mono text-xs" asChild>
              <a href={LANG_PATH[otherLang]} hrefLang={otherLang} aria-label={ui.switchLangLabel}>
                {otherLang.toUpperCase()}
              </a>
            </Button>
            <ThemeToggle label={ui.toggleTheme} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 print:space-y-8 print:p-0">
        {/* Hero */}
        <section className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{D.name}</h1>
              <p className="text-lg font-medium text-primary">{t(D.headline, lang)}</p>
            </div>
            <p className="max-w-xl text-pretty text-muted-foreground">{t(D.tagline, lang)}</p>

            <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
              <li>
                <a href={D.locationLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <MapPinIcon className="size-3.5" />
                  {t(D.location, lang)}
                </a>
              </li>
              <li>
                <a href={`mailto:${D.contact.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <MailIcon className="size-3.5" />
                  {D.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${D.contact.tel}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <PhoneIcon className="size-3.5" />
                  {prettyPhone(D.contact.tel)}
                </a>
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-2 pt-1 print:hidden">
              <PrintButton label={ui.downloadPdf} />
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

          <Avatar className="size-24 shrink-0 rounded-2xl ring-1 ring-border sm:size-28 print:size-20">
            <AvatarImage alt={D.name} src={D.avatarUrl} className="rounded-2xl" />
            <AvatarFallback className="rounded-2xl">{D.initials}</AvatarFallback>
          </Avatar>
        </section>

        {/* Highlights */}
        <section
          aria-label="Highlights"
          className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 print:hidden"
        >
          {D.highlights.map((h) => (
            <div key={h.label.en} className="bg-card p-5">
              <div className="text-2xl font-semibold tracking-tight">{t(h.value, lang)}</div>
              <div className="mt-1 text-sm text-muted-foreground">{t(h.label, lang)}</div>
            </div>
          ))}
        </section>

        {/* About */}
        <section>
          <SectionTitle index={1}>{ui.about}</SectionTitle>
          <p className="text-pretty leading-relaxed text-muted-foreground">{t(D.summary, lang)}</p>
        </section>

        {/* Experience */}
        <section>
          <SectionTitle index={2}>{ui.experience}</SectionTitle>
          <ol className="relative ml-1.5 space-y-10 border-l border-border pl-6 print:space-y-5">
            {D.work.map((job, jobIndex) => {
              const isCurrent = job.roles[0].end === null;
              return (
                <li key={job.company} className="relative break-inside-avoid">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[30.5px] top-1.5 size-3 rounded-full ring-4 ring-background",
                      isCurrent ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                  />
                  <h3 className="text-lg font-semibold leading-none">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 hover:text-primary"
                    >
                      {job.company}
                      <ArrowUpRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100 print:hidden" />
                    </a>
                  </h3>

                  <div className="mt-3 space-y-5">
                    {job.roles.map((role) => (
                      <div key={role.title.en}>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <h4 className="font-medium">
                            {t(role.title, lang)}
                            {role.end === null && jobIndex === 0 && (
                              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 align-middle font-mono text-[10px] font-normal text-primary print:hidden">
                                <span className="size-1.5 rounded-full bg-primary" />
                                {ui.currently}
                              </span>
                            )}
                          </h4>
                          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                            {formatDate(role.start, lang)} — {formatDate(role.end, lang)}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                          {role.bullets.map((b) => (
                            <li key={b.en} className="flex gap-2 text-pretty">
                              <span aria-hidden className="select-none text-primary">▹</span>
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
                </li>
              );
            })}
          </ol>
        </section>

        {/* Skills */}
        <section className="break-inside-avoid">
          <SectionTitle index={3}>{ui.skills}</SectionTitle>
          <dl className="space-y-4 print:space-y-2">
            {D.skills.map((group) => (
              <div key={group.category.en} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm font-medium">{t(group.category, lang)}</dt>
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
        <section className="break-inside-avoid">
          <SectionTitle index={4}>{ui.education}</SectionTitle>
          <ul className="space-y-4">
            {D.education.map((edu) => (
              <li
                key={edu.degree.en}
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <div>
                  <div className="font-medium">{edu.school}</div>
                  <div className="text-sm text-muted-foreground">{t(edu.degree, lang)}</div>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {edu.start} — {edu.end}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Projects */}
        <section className="break-inside-avoid">
          <SectionTitle index={5}>{ui.projects}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {D.projects.map((project) => (
              <div
                key={project.title}
                className="flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
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
      </main>

      <footer className="border-t border-border/60 print:hidden">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-6 font-mono text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} {D.name}
          </span>
          <span>{ui.footer}</span>
        </div>
      </footer>
    </div>
  );
}
