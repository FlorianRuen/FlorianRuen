import { Fragment } from "react";
import { RESUME_DATA } from "@/data/resume-data";
import { UI, formatDate, t, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** First year shown on the axis (earlier education stays in the Education list). */
const AXIS_START = 2013;

type Tone = "study" | "past" | "current";

type Segment = {
  key: string;
  label: string;
  start: string;
  end: string | null;
  tone: Tone;
};

type Row = { label: string; segments: Segment[] };

/**
 * "YYYY" or "YYYY-MM" -> fractional year. A month-precise end covers that whole
 * month; `null` (present) is the build date, refreshed on every deploy.
 */
function toYear(value: string | null, edge: "start" | "end"): number {
  if (value === null) {
    const now = new Date();
    return now.getUTCFullYear() + (now.getUTCMonth() + 1) / 12;
  }
  const [year, month] = value.split("-").map(Number);
  if (!month) return year;
  return year + (edge === "start" ? month - 1 : month) / 12;
}

function buildRows(lang: Lang): Row[] {
  const studies: Row[] = RESUME_DATA.education
    .filter((edu) => Number(edu.start) >= AXIS_START)
    .toReversed()
    .map((edu) => ({
      label: edu.school,
      segments: [
        { key: edu.degree.en, label: t(edu.degree, lang), start: edu.start, end: edu.end, tone: "study" },
      ],
    }));

  const jobs: Row[] = RESUME_DATA.work.toReversed().map((job) => ({
    label: job.company,
    segments: job.roles.toReversed().map((role) => ({
      key: role.title.en,
      label: t(role.title, lang),
      start: role.start,
      end: role.end,
      tone: role.end === null ? "current" : "past",
    })),
  }));

  return [...studies, ...jobs];
}

const TONE_CLASS: Record<Tone, string> = {
  study: "bg-slate-400 dark:bg-slate-500",
  past: "bg-primary/55",
  current: "bg-primary",
};

export function CareerChart({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const rows = buildRows(lang);
  const axisEnd = toYear(null, "end");
  const span = axisEnd - AXIS_START;
  const pct = (year: number) => ((year - AXIS_START) / span) * 100;

  const ticks: number[] = [];
  for (let y = AXIS_START + 1; y <= axisEnd; y += 2) ticks.push(y);

  const legend: { tone: Tone; label: string }[] = [
    { tone: "study", label: ui.legendStudies },
    { tone: "past", label: ui.legendExperience },
    { tone: "current", label: ui.legendCurrent },
  ];

  return (
    <figure className="rounded-xl border border-border bg-card p-4 sm:p-5 print:hidden">
      <figcaption className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {ui.careerTitle}
        </span>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legend.map((item) => (
            <li key={item.tone} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("h-2 w-3 rounded-[2px]", TONE_CLASS[item.tone])} />
              {item.label}
            </li>
          ))}
        </ul>
      </figcaption>

      <div
        className="mt-5 grid items-center gap-x-3 gap-y-2"
        style={{ gridTemplateColumns: "minmax(0, 7.5rem) 1fr" }}
      >
        {/* Year gridlines, behind the bars, spanning every row. */}
        <div
          aria-hidden
          className="pointer-events-none relative col-start-2 self-stretch"
          style={{ gridRow: `1 / span ${rows.length}` }}
        >
          {ticks.map((y) => (
            <span
              key={y}
              className="absolute inset-y-0 w-px bg-border/70"
              style={{ left: `${pct(y)}%` }}
            />
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <Fragment key={row.label}>
            <div
              className="col-start-1 truncate text-xs text-muted-foreground"
              style={{ gridRow: rowIndex + 1 }}
              title={row.label}
            >
              {row.label}
            </div>
            <div className="relative col-start-2 h-4" style={{ gridRow: rowIndex + 1 }}>
              {row.segments.map((seg, segIndex) => {
                const left = pct(toYear(seg.start, "start"));
                const right = pct(toYear(seg.end, "end"));
                const dates = `${formatDate(seg.start, lang)} — ${formatDate(seg.end, lang)}`;
                return (
                  <div
                    key={seg.key}
                    className="group absolute inset-y-0"
                    style={{
                      left: `${left}%`,
                      // 2px surface gap between consecutive roles on the same row.
                      width: `calc(${right - left}% - ${segIndex < row.segments.length - 1 ? 2 : 0}px)`,
                    }}
                  >
                    <div
                      className={cn(
                        "bar-grow h-full rounded-[4px] transition-[filter] duration-150 group-hover:brightness-110",
                        TONE_CLASS[seg.tone],
                      )}
                    />
                    <span className="sr-only">
                      {row.label}, {seg.label}: {dates}
                    </span>
                    {/* Hover tooltip; anchored to the side with room so it never overflows. */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute bottom-full z-20 mb-2 w-max max-w-[15rem] rounded-md border border-border bg-popover px-2.5 py-1.5 text-left opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100",
                        left > 55 ? "right-0" : "left-0",
                      )}
                    >
                      <span className="block text-xs font-medium text-foreground">{row.label}</span>
                      <span className="block text-xs text-muted-foreground">{seg.label}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                        {dates}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Fragment>
        ))}

        {/* Axis */}
        <div className="relative col-start-2 h-4" style={{ gridRow: rows.length + 1 }} aria-hidden>
          {ticks.map((y) => (
            <span
              key={y}
              className={cn(
                "absolute -translate-x-1/2 font-mono text-[10px] tabular-nums text-muted-foreground",
                // On phones, show every other tick (2014, 2018, 2022, 2026) so labels never touch.
                ((y - AXIS_START - 1) / 2) % 2 === 1 && "max-sm:hidden",
              )}
              style={{ left: `${pct(y)}%` }}
            >
              {y}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
