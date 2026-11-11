"use client";

import { PlayIcon, ShuffleIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { Button } from "./ui/button";

/**
 * The rendered versions a visitor can get (files in public/video). One is
 * drawn at random the first time the page is opened and remembered, so a
 * recruiter who comes back or shares the link sees the same video; the
 * "another version" button cycles through the others.
 *   "resume-v5" = the trailer (cuts on the beat, kinetic typography)
 *   "resume-v3" = IDE + mountain-bike "who I am" chapter
 *   "resume-v2" = IDE / CI / Kubernetes take
 * ("resume" = v1 kinetic typography is rendered too but no longer offered.)
 */
const VIDEOS = ["resume-v5", "resume-v3", "resume-v2"] as const;
type Video = (typeof VIDEOS)[number];
const STORAGE_KEY = "resume-video";
const isVideo = (v: unknown): v is Video => VIDEOS.includes(v as Video);

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
  otherLabel,
  versionLabel,
}: {
  lang: Lang;
  label: string;
  closeLabel: string;
  otherLabel: string;
  versionLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Server and first client render agree on the default; the stored or
  // random pick is applied after hydration.
  const [video, setVideo] = useState<Video>(VIDEOS[0]);

  useEffect(() => {
    let pick: Video | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isVideo(stored)) pick = stored;
    } catch {
      // Storage can be blocked; a fresh draw is fine.
    }
    if (!pick) {
      pick = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
      try {
        window.localStorage.setItem(STORAGE_KEY, pick);
      } catch {
        // Nothing to do: the pick just won't persist.
      }
    }
    setVideo(pick);
  }, []);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
    videoRef.current?.play().catch(() => {
      // Autoplay with sound can be refused; the native controls are still there.
    });
  }, []);
  const close = useCallback(() => dialogRef.current?.close(), []);

  const next = useCallback(() => {
    const v = VIDEOS[(VIDEOS.indexOf(video) + 1) % VIDEOS.length];
    setVideo(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // Nothing to do.
    }
    // The <source> elements changed: reload and play the new file.
    requestAnimationFrame(() => {
      const el = videoRef.current;
      if (!el) return;
      el.load();
      el.play().catch(() => {});
    });
  }, [video]);

  const version = video.replace("resume-", "");

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
        <div className="absolute -top-10 right-0 flex items-center gap-1">
          <button
            type="button"
            onClick={next}
            className="inline-flex h-8 items-center gap-2 rounded-md px-2 font-mono text-xs text-white/80 hover:bg-white/10 hover:text-white"
          >
            <ShuffleIcon className="size-4" />
            {otherLabel}
            <span className="text-white/50">
              · {versionLabel} {version}
            </span>
          </button>
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="inline-flex size-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        {/* biome-ignore lint/a11y/useMediaCaption: music only, every word is on screen */}
        <video
          key={video}
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={`/video/${video}-${lang}.jpg`}
          className="aspect-video w-full rounded-xl bg-black shadow-2xl shadow-black/50"
        >
          <source src={`/video/${video}-${lang}.webm`} type="video/webm" />
          <source src={`/video/${video}-${lang}.mp4`} type="video/mp4" />
        </video>
      </dialog>
    </>
  );
}
