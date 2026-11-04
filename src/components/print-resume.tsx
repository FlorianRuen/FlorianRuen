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

const D = RESUME_DATA;

/**
 * Print-only resume ("Download PDF"). Hidden on screen; when printing, the
 * website is hidden and this classic two-column A4 layout is shown instead.
 * Built from the same data as the site, so the PDF never goes out of date.
 * Styles: `.cv-*` rules in globals.css (print section).
 */

function prettyPhone(tel: string) {
  return tel.replace(
    /^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "+33 $1 $2 $3 $4 $5",
  );
}

const stripUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function SideTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="cv-side-title">{children}</h2>;
}

function MainTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="cv-main-title">{children}</h2>;
}

export function PrintResume({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const site = `${SITE_URL}${LANG_PATH[lang]}`;

  return (
    <div className="cv" aria-hidden="true">
      {/* Header band */}
      <header className="cv-header">
        {/* biome-ignore lint/performance/noImgElement: print-only, a plain <img> loads reliably for the PDF */}
        <img src={D.avatarUrl} alt="" className="cv-photo" />
        <div>
          <h1 className="cv-name">{D.name}</h1>
          <p className="cv-headline">{t(D.headline, lang)}</p>
          <p className="cv-tagline">{t(D.tagline, lang)}</p>
        </div>
      </header>

      <div className="cv-body">
        {/* Sidebar */}
        <aside className="cv-side">
          <section>
            <SideTitle>Contact</SideTitle>
            <ul className="cv-contact">
              <li>{t(D.location, lang)}</li>
              <li>
                <a href={`mailto:${D.contact.email}`}>{D.contact.email}</a>
              </li>
              <li>{prettyPhone(D.contact.tel)}</li>
              {D.contact.social.map((s) => (
                <li key={s.name}>
                  <a href={s.url}>{stripUrl(s.url)}</a>
                </li>
              ))}
              <li>
                <a href={site}>{stripUrl(site)}</a>
              </li>
            </ul>
          </section>

          <section>
            <SideTitle>
              {lang === "fr" ? "En chiffres" : "Key figures"}
            </SideTitle>
            <ul className="cv-figures">
              {D.highlights.map((h) => (
                <li key={h.label.en}>
                  <strong>{t(h.value, lang)}</strong>
                  <span>{t(h.label, lang)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SideTitle>{ui.skills}</SideTitle>
            {D.skills.map((group) => (
              <div key={group.category.en} className="cv-skill-group">
                <h3>{t(group.category, lang)}</h3>
                <p>{group.items.map((item) => t(item, lang)).join(" · ")}</p>
              </div>
            ))}
          </section>

          <section>
            <SideTitle>{ui.interests}</SideTitle>
            <p className="cv-interests">
              {D.interests.map((item) => t(item, lang)).join(" · ")}
            </p>
          </section>
        </aside>

        {/* Main column */}
        <main className="cv-main">
          <section>
            <MainTitle>{ui.about}</MainTitle>
            <p className="cv-summary">{t(D.summary, lang)}</p>
          </section>

          <section>
            <MainTitle>{ui.experience}</MainTitle>
            {D.work.map((job) => (
              <article key={job.company} className="cv-job">
                <h3 className="cv-company">
                  {job.company}
                  <span className="cv-tech">{job.tech.join(" · ")}</span>
                </h3>
                {"summary" in job && (
                  <p className="cv-product">{t(job.summary, lang)}</p>
                )}
                {job.roles.map((role) => (
                  <div key={role.title.en} className="cv-role">
                    <div className="cv-role-head">
                      <h4>{t(role.title, lang)}</h4>
                      <span className="cv-dates">
                        {formatDate(role.start, lang)} –{" "}
                        {formatDate(role.end, lang)}
                      </span>
                    </div>
                    <ul>
                      {role.bullets.map((b) => (
                        <li key={b.en}>{t(b, lang)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {"press" in job && (
                  <p className="cv-press">
                    <strong>
                      {t(job.press.label, lang)}
                      {lang === "fr" ? "\u00a0: " : ": "}
                    </strong>
                    {job.press.items.map((i) => i.name).join(", ")}
                  </p>
                )}
              </article>
            ))}
          </section>
          <section>
            <MainTitle>{ui.education}</MainTitle>
            {D.education.map((edu) => (
              <div key={edu.degree.en} className="cv-entry">
                <div>
                  <h3>{edu.school}</h3>
                  <p>{t(edu.degree, lang)}</p>
                </div>
                <span className="cv-dates">
                  {edu.start} – {edu.end}
                </span>
              </div>
            ))}
          </section>

          <section>
            <MainTitle>{ui.projects}</MainTitle>
            {D.projects.map((p) => (
              <div key={p.title} className="cv-entry">
                <div>
                  <h3>{p.title}</h3>
                  <p>{t(p.description, lang)}</p>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>

      <footer className="cv-footer">
        {ui.printFooter} <a href={site}>{stripUrl(site)}</a> · {ui.lastUpdated}{" "}
        {formatMonth(BUILD_DATE, lang)}
      </footer>
    </div>
  );
}
