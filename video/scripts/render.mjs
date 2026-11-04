/**
 * Renders the resume video in every language and writes web-ready files to
 * the website's public/video folder:
 *   resume-<lang>.mp4   H.264 + AAC, faststart (Safari / iOS)
 *   resume-<lang>.webm  VP9 + Opus (smaller, Chrome / Firefox)
 *   resume-<lang>.jpg   poster frame
 *
 *
 * Usage: npm run render                 (v1, all languages)
 *        npm run render -- fr           (v1, one language)
 *        npm run render -- --v2         (v2 "IDE" version → resume-v2-<lang>.*)
 *        npm run render -- --v2 en
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

const args = process.argv.slice(2);
const v2 = args.includes("--v2");
const rest = args.filter((a) => !a.startsWith("--"));
const langs = rest.length ? rest : ["en", "fr"];
const music = v2 ? "make-music-v2.mjs" : "make-music.mjs";
const soundtrack = v2 ? "soundtrack-v2.wav" : "soundtrack.wav";
// Poster: a frame that shows the name (v1 hero) or the typed florian.go (v2).
const posterAt = v2 ? "7" : "10";
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit" });

if (!existsSync(join(root, "public", soundtrack))) {
  run("node", [`scripts/${music}`]);
}

for (const lang of langs) {
  const id = v2 ? `resume-v2-${lang}` : `resume-${lang}`;
  const raw = join(tmpDir, `raw-${id}.mp4`);
  run("npx", [
    "remotion", "render", "src/index.ts", id, raw,
    "--codec=h264", "--crf=16", "--log=error",
  ]);

  const audio = "loudnorm=I=-14:TP=-1.5:LRA=11";
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", raw,
    "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p",
    "-af", audio, "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart", join(outDir, `${id}.mp4`),
  ]);
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", raw,
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
    "-af", audio, "-c:a", "libopus", "-b:a", "128k",
    join(outDir, `${id}.webm`),
  ]);
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-ss", posterAt, "-i", raw,
    "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "4",
    join(outDir, `${id}.jpg`),
  ]);
  console.log(`✓ ${id}`);
}
