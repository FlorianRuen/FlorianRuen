/**
 * Renders the resume video in every language and writes web-ready files to
 * the website's public/video folder:
 *   resume-<lang>.mp4   H.264 + AAC, faststart (Safari / iOS)
 *   resume-<lang>.webm  VP9 + Opus (smaller, Chrome / Firefox)
 *   resume-<lang>.jpg   poster frame
 *
 * Usage: npm run render            (all languages)
 *        npm run render -- fr      (one language)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "..", "public", "video");
const tmpDir = join(root, "out");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const langs = process.argv.slice(2).length ? process.argv.slice(2) : ["en", "fr"];
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit" });

if (!existsSync(join(root, "public", "soundtrack.wav"))) {
  run("node", ["scripts/make-music.mjs"]);
}

for (const lang of langs) {
  const raw = join(tmpDir, `raw-${lang}.mp4`);
  run("npx", [
    "remotion", "render", "src/index.ts", `resume-${lang}`, raw,
    "--codec=h264", "--crf=16", "--log=error",
  ]);

  const audio = "loudnorm=I=-14:TP=-1.5:LRA=11";
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", raw,
    "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p",
    "-af", audio, "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart", join(outDir, `resume-${lang}.mp4`),
  ]);
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", raw,
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
    "-af", audio, "-c:a", "libopus", "-b:a", "128k",
    join(outDir, `resume-${lang}.webm`),
  ]);
  // Poster: the hero shot (name + avatar), 10 s in.
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-ss", "10", "-i", raw,
    "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "4",
    join(outDir, `resume-${lang}.jpg`),
  ]);
  console.log(`✓ resume-${lang}`);
}
