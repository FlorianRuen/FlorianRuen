"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { useRef, useState } from "react";

function formatTime(sec: number): string {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Compact audio player with a waveform. The waves come from precomputed
 * `peaks`, so nothing is downloaded until the visitor presses play
 * (preload="none"). Seeking uses an invisible native range input laid over
 * the waves, which gives keyboard and screen-reader support for free.
 */
export function AudioPlayer({
  src,
  peaks,
  durationSec,
  title,
  dateLabel,
  copyright,
  sourceUrl,
  labels,
}: {
  src: string;
  peaks: readonly number[];
  durationSec: number;
  title: string;
  dateLabel: string;
  copyright: string;
  sourceUrl: string;
  labels: { listen: string; pause: string; seek: string; originalPage: string };
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSec);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  const seek = (value: number) => {
    setCurrent(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const bars = (className: string, style?: React.CSSProperties) => (
    <div
      aria-hidden
      style={style}
      className={`absolute inset-0 flex items-center gap-px ${className}`}
    >
      {peaks.map((p, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static list, never reordered
          key={i}
          className="flex-1 rounded-full bg-current"
          style={{ height: `${p}%` }}
        />
      ))}
    </div>
  );

  return (
    <figure className="mt-3 rounded-lg border border-border bg-muted/40 p-3 print:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? labels.pause : labels.listen}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          {playing ? (
            <PauseIcon className="size-4 fill-current" />
          ) : (
            <PlayIcon className="ml-0.5 size-4 fill-current" />
          )}
        </button>

        <div className="relative h-9 min-w-0 flex-1 rounded focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          {bars("text-muted-foreground/30")}
          {/* Played part: same bars in the accent colour, clipped to the progress. */}
          {bars("text-primary", { clipPath: `inset(0 ${100 - progress}% 0 0)` })}
          <input
            type="range"
            min={0}
            max={Math.round(duration)}
            step={1}
            value={Math.round(current)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={labels.seek}
            aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>

      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          <span className="font-medium text-foreground/80">{title}</span> ·{" "}
          {dateLabel}
        </span>
        <span>
          {copyright} ·{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
          >
            {labels.originalPage}
          </a>
        </span>
      </figcaption>

      {/* biome-ignore lint/a11y/useMediaCaption: radio interview, no transcript available */}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
      />
    </figure>
  );
}
