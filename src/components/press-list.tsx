"use client";

import { HeadphonesIcon } from "lucide-react";
import { useId, useState } from "react";
import { AudioPlayer } from "@/components/audio-player";

type PressItem = { name: string; url: string | null; replay?: boolean };

/**
 * "In the press" row. The item flagged `replay` is a toggle that opens the
 * interview player below the row, so the player is one click away without
 * taking room in the timeline by default.
 */
export function PressList({
  label,
  items,
  player,
}: {
  label: string;
  items: readonly PressItem[];
  player?: Omit<React.ComponentProps<typeof AudioPlayer>, "id" | "autoPlay"> & {
    durationLabel: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const playerId = useId();

  return (
    <>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {items.map((item) =>
          item.replay && player ? (
            <button
              key={item.name}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={playerId}
              className="inline-flex items-baseline gap-1 text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <HeadphonesIcon
                aria-hidden
                className="size-3 translate-y-0.5 self-start print:hidden"
              />
              {item.name}
              <span className="font-mono text-[10px] text-muted-foreground no-underline print:hidden">
                {player.durationLabel}
              </span>
            </button>
          ) : item.url ? (
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
            <span key={item.name} className="text-foreground/80">
              {item.name}
            </span>
          ),
        )}
      </div>

      {player && open && <AudioPlayer id={playerId} autoPlay {...player} />}
    </>
  );
}
