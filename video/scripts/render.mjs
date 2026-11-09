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
 *        npm run render -- --v3         (v3 "IDE + trail" version → resume-v3-<lang>.*)
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
const version = args.includes("--v3") ? 3 : args.includes("--v2") ? 2 : 1;
const rest = args.filter((a) => !a.startsWith("--"));
const langs = rest.length ? rest : ["en", "fr"];
const suffix = version === 1 ? "" : `-v${version}`;
const music = `make-music${suffix}.mjs`;
const soundtrack = `soundtrack${suffix}.wav`;
// Poster: the name (v1 hero), the typed florian.go (v2), the summit of the ride (v3).
const posterAt = { 1: "10", 2: "7", 3: "66.2" }[version];
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit" });

if (!existsSync(join(root, "public", soundtrack))) {
  run("node", [`scripts/${music}`]);
}

for (const lang of langs) {
  const id = version === 1 ? `resume-${lang}` : `resume-v${version}-${lang}`;
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
