import { RESUME_DATA } from "@/data/resume-data";
import { LANG_PATH, formatDate, t, type Lang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

/**
 * Machine-readable versions of the resume, built from the same data as the
 * site: plain text for `curl https://florianruen.fr/cv`, and the JSON Resume standard
 * (https://jsonresume.org/schema) for /resume.json.
 */

const D = RESUME_DATA;

/** "YYYY" / "YYYY-MM" -> ISO "YYYY" / "YYYY-MM" (JSON Resume accepts both). */
const iso = (value: string | null) => value ?? undefined;

export function toJsonResume(lang: Lang = "en") {
  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: D.name,
      label: t(D.headline, lang),
      image: `${SITE_URL}${D.avatarUrl}`,
      email: D.contact.email,
      phone: D.contact.tel,
      url: `${SITE_URL}${LANG_PATH[lang]}`,
      summary: t(D.summary, lang),
      location: { city: "Paris", countryCode: "FR" },
      profiles: D.contact.social.map((s) => ({
        network: s.name,
        username: s.url.replace(/\/$/, "").split("/").pop(),
        url: s.url,
      })),
    },
    work: D.work.flatMap((job) =>
      job.roles.map((role) => ({
        name: job.company,
        position: t(role.title, lang),
        url: job.link,
        startDate: iso(role.start),
        endDate: iso(role.end),
        summary: "summary" in job ? t(job.summary, lang) : undefined,
        highlights: role.bullets.map((b) => t(b, lang)),
      })),
    ),
    education: D.education.map((edu) => ({
      institution: edu.school,
      studyType: t(edu.degree, lang),
      startDate: edu.start,
      endDate: edu.end,
    })),
    awards: [
      {
        title:
          lang === "fr"
            ? "Prix de l'innovation Préventica"
            : "Préventica Innovation Award",
        date: "2021",
        awarder: "Préventica",
        summary: "Eyes'R",
      },
    ],
    skills: D.skills.map((group) => ({
      name: t(group.category, lang),
      keywords: group.items.map((item) => t(item, lang)),
    })),
    languages: [
      {
        language: lang === "fr" ? "Français" : "French",
        fluency: lang === "fr" ? "Langue maternelle" : "Native",
      },
      {
        language: lang === "fr" ? "Anglais" : "English",
        fluency: lang === "fr" ? "Professionnel" : "Professional",
      },
    ],
    projects: D.projects.map((p) => ({
      name: p.title,
      description: t(p.description, lang),
      keywords: p.tags.map((tag) => t(tag, lang)),
    })),
    interests: D.interests.map((item) => ({ name: t(item, lang) })),
    meta: {
      canonical: `${SITE_URL}/resume.json`,
      lastModified: new Date().toISOString(),
    },
  };
}

/* ---------------------------------------------------------------- text -- */

const WIDTH = 72;

function wrap(text: string, indent = "", firstIndent = indent): string {
  const lines: string[] = [];
  let line = "";
  let prefix = firstIndent;
  for (const word of text.split(/\s+/)) {
    if (line && prefix.length + line.length + 1 + word.length > WIDTH) {
      lines.push(prefix + line);
      line = word;
      prefix = indent;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(prefix + line);
  return lines.join("\n");
}

/** `left` and `right` on one line, `right` aligned to column WIDTH. */
const spread = (left: string, right: string) =>
  `${left}${" ".repeat(Math.max(2, WIDTH - left.length - right.length))}${right}`;

const prettyPhone = (tel: string) =>
  tel.replace(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "+33 $1 $2 $3 $4 $5");

/** Plain-text resume for terminals (`curl https://florianruen.fr/cv`) and copy/paste. */
export function toText(lang: Lang = "en"): string {
  const fr = lang === "fr";
  const rule = "─".repeat(WIDTH);
  const out: string[] = [];
  const section = (title: string) =>
    out.push("", "", title.toUpperCase(), rule);

  out.push(
    "",
    D.name.toUpperCase(),
    t(D.headline, lang),
    "",
    wrap(t(D.tagline, lang)),
    "",
    [t(D.location, lang), D.contact.email, prettyPhone(D.contact.tel)].join(
      " · ",
    ),
    D.contact.social
      .map((s) => s.url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""))
      .join(" · "),
  );

  section(fr ? "À propos" : "About");
  out.push(wrap(t(D.summary, lang)));

  section(fr ? "Expérience" : "Experience");
  D.work.forEach((job, i) => {
    if (i > 0) out.push("");
    const tech = job.tech.join(", ");
    if (job.company.length + tech.length + 2 <= WIDTH)
      out.push(spread(job.company, tech));
    else out.push(job.company, wrap(tech, "  "));
    if ("summary" in job) out.push(wrap(t(job.summary, lang), "  "));
    for (const role of job.roles) {
      out.push(
        "",
        spread(
          `  ${t(role.title, lang)}`,
          `${formatDate(role.start, lang)} – ${formatDate(role.end, lang)}`,
        ),
      );
      for (const b of role.bullets)
        out.push(wrap(t(b, lang), "      ", "    • "));
    }
    if ("press" in job) {
      out.push(
        "",
        wrap(
          `${t(job.press.label, lang)}: ${job.press.items.map((p) => p.name).join(", ")}`,
          "  ",
        ),
      );
    }
  });

  section(fr ? "Compétences" : "Skills");
  for (const group of D.skills) {
    const label = t(group.category, lang).padEnd(20);
    out.push(
      wrap(
        group.items.map((item) => t(item, lang)).join(", "),
        " ".repeat(20),
        label,
      ),
    );
  }

  section(fr ? "Formation" : "Education");
  for (const edu of D.education) {
    out.push(
      spread(edu.school, `${edu.start} – ${edu.end}`),
      wrap(t(edu.degree, lang), "  "),
    );
  }

  section(fr ? "Projets & bénévolat" : "Projects & volunteering");
  for (const p of D.projects)
    out.push(wrap(`${p.title} — ${t(p.description, lang)}`, "  "));

  section(fr ? "Centres d'intérêt" : "Interests");
  out.push(wrap(D.interests.map((item) => t(item, lang)).join(" · ")));

  out.push(
    "",
    "",
    rule,
    `Web & PDF : ${SITE_URL}${LANG_PATH[lang]}`.replace(
      " :",
      fr ? "\u00a0:" : ":",
    ),
    `JSON      : ${SITE_URL}/resume.json`.replace(" :", fr ? "\u00a0:" : ":"),
    `Source    : https://github.com/FlorianRuen/FlorianRuen`.replace(
      " :",
      fr ? "\u00a0:" : ":",
    ),
    "",
  );
  return out.join("\n");
}

/* ------------------------------------------------------------- llms.txt -- */

/**
 * /llms.txt (https://llmstxt.org): a Markdown summary for AI assistants, so a
 * chatbot or a recruiter's screening tool asked about me reads accurate facts
 * instead of scraped HTML. Always English, the lingua franca for these tools.
 */
export function toLlmsTxt(): string {
  const lang: Lang = "en";
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

  const work = D.work
    .map((job) => {
      const roles = job.roles
        .map(
          (role) =>
            `- **${t(role.title, lang)}** (${formatDate(role.start, lang)} – ${formatDate(role.end, lang)})\n${role.bullets
              .map((b) => `  - ${t(b, lang)}`)
              .join("\n")}`,
        )
        .join("\n");
      const summary = "summary" in job ? `\n${t(job.summary, lang)}\n` : "";
      const press =
        "press" in job
          ? `\nPress coverage: ${job.press.items.map((p) => p.name).join(", ")}.\n`
          : "";
      return `### ${job.company}\nTech: ${job.tech.join(", ")}\n${summary}\n${roles}\n${press}`;
    })
    .join("\n");

  return `# ${D.name}

> ${t(D.headline, lang)}, based in ${t(D.location, lang)}. ${t(D.tagline, lang)}

${t(D.summary, lang)}

## Key facts

${list(D.highlights.map((h) => `${t(h.value, lang)} ${t(h.label, lang)}`))}
- Languages: French (native), English (professional)
- Contact: ${D.contact.email}

## Experience

${work}
## Skills

${list(
  D.skills.map(
    (g) =>
      `${t(g.category, lang)}: ${g.items.map((item) => t(item, lang)).join(", ")}`,
  ),
)}

## Education

${list(D.education.map((e) => `${e.school}: ${t(e.degree, lang)} (${e.start} – ${e.end})`))}

## Projects & volunteering

${list(D.projects.map((p) => `${p.title}: ${t(p.description, lang)}`))}

## Interests

${D.interests.map((i) => t(i, lang)).join(", ")}

## Links

- [Resume (English)](${SITE_URL}/): full resume, also downloadable as PDF
- [Resume (French)](${SITE_URL}/fr): same content in French
- [Plain text](${SITE_URL}/cv): \`curl ${SITE_URL}/cv\`
- [JSON Resume](${SITE_URL}/resume.json): machine-readable, jsonresume.org schema
${D.contact.social.map((s) => `- [${s.name}](${s.url})`).join("\n")}
`;
}

/* ---------------------------------------------------------------- vCard -- */

/** Escapes a vCard text value (RFC 6350 §3.4). */
const vc = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** vCard 3.0 contact card, so recruiters can save me to their phone in one tap. */
export function toVCard(avatarBase64?: string): string {
  const [first, ...rest] = D.name.split(" ");
  const current = D.work[0];
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${vc(rest.join(" "))};${vc(first)};;;`,
    `FN:${vc(D.name)}`,
    `ORG:${vc(current.company)}`,
    `TITLE:${vc(t(current.roles[0].title, "en"))}`,
    `EMAIL;TYPE=INTERNET:${D.contact.email}`,
    `TEL;TYPE=CELL:${D.contact.tel}`,
    "ADR;TYPE=WORK:;;;Paris;;;France",
    `URL:${SITE_URL}`,
    ...D.contact.social.map(
      (s) => `X-SOCIALPROFILE;TYPE=${s.name.toLowerCase()}:${s.url}`,
    ),
    ...(avatarBase64 ? [`PHOTO;ENCODING=b;TYPE=JPEG:${avatarBase64}`] : []),
    `NOTE:${vc(t(D.tagline, "en"))}`,
    "END:VCARD",
  ];
  // vCard wants CRLF line endings and lines folded at 75 characters (RFC 6350 §3.2).
  const fold = (line: string) =>
    line.length <= 75
      ? line
      : (line.match(/^.{75}|.{1,74}/g) ?? [line]).join("\r\n ");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
