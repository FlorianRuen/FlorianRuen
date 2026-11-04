"use client";

import { PlayIcon, XIcon } from "lucide-react";
import { useCallback, useRef } from "react";
import type { Lang } from "@/lib/i18n";
import { Button } from "./ui/button";

/**
 * "Watch the 1-min video" button: opens the animated resume (made with
 * Remotion, see /video) in a native <dialog>, so Esc, focus trapping and the
 * backdrop come for free. Nothing is downloaded until the dialog opens
 * (preload="none"), and the video pauses when it closes.
 */
export function VideoButton({
  lang,
  label,
  closeLabel,
}: {
  lang: Lang;
  label: string;
  closeLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
    videoRef.current?.play().catch(() => {
      // Autoplay with sound can be refused; the native controls are still there.
    });
  }, []);
  const close = useCallback(() => dialogRef.current?.close(), []);

  return (
    <>
      <Button size="sm" variant="outline" onClick={open}>
        <PlayIcon className="mr-2 size-4 fill-current" />
        {label}
      </Button>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Esc already closes a native dialog; the click only handles the backdrop */}
      <dialog
        ref={dialogRef}
        aria-label={label}
        onClick={(e) => e.target === dialogRef.current && close()}
        onClose={() => videoRef.current?.pause()}
        className="palette m-auto w-[min(64rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={close}
          aria-label={closeLabel}
          className="absolute -top-10 right-0 inline-flex size-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
        >
          <XIcon className="size-5" />
        </button>
        {/* biome-ignore lint/a11y/useMediaCaption: music only, every word is on screen */}
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={`/video/resume-${lang}.jpg`}
          className="aspect-video w-full rounded-xl bg-black shadow-2xl shadow-black/50"
        >
          <source src={`/video/resume-${lang}.webm`} type="video/webm" />
          <source src={`/video/resume-${lang}.mp4`} type="video/mp4" />
        </video>
      </dialog>
    </>
  );
}
