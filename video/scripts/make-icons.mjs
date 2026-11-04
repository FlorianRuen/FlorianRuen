/**
 * Renders the site icon (video/src/Icon.tsx) into every file Next.js serves
 * from src/app, using file conventions so no <link> tags are needed:
 *   icon.svg        modern browsers (scales to any size)
 *   icon.png        512 px, used by the web manifest and as a fallback
 *   favicon.ico     16 + 32 + 48 px, for legacy browsers and /favicon.ico
 *   apple-icon.png  180 px, full-bleed (iOS applies its own rounded mask)
 *
 * Usage: npm run icons
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "..", "src", "app");
const tmp = mkdtempSync(join(tmpdir(), "icons-"));

const still = (out, size, full = false) =>
  execFileSync(
    "npx",
    [
      "remotion", "still", "src/index.ts", "icon", out,
      "--frame=0", "--image-format=png", `--scale=${size / 512}`, "--log=error",
      `--props=${JSON.stringify({ full })}`,
    ],
    { cwd: root, stdio: "inherit" },
  );

// SVG: same source as the React component.
const src = readFileSync(join(root, "src", "Icon.tsx"), "utf8");
const svg = src.match(/ICON_SVG = `([\s\S]*?)`;/)?.[1];
if (!svg) throw new Error("ICON_SVG not found in src/Icon.tsx");
writeFileSync(join(app, "icon.svg"), `${svg}\n`);

still(join(app, "icon.png"), 512);
still(join(app, "apple-icon.png"), 180, true);

// favicon.ico: PNG-compressed entries (supported by every current browser).
const sizes = [16, 32, 48];
const pngs = sizes.map((s) => {
  const p = join(tmp, `${s}.png`);
  still(p, s);
  return readFileSync(p);
});
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(join(app, "favicon.ico"), Buffer.concat([header, ...pngs]));
rmSync(tmp, { recursive: true, force: true });

console.log("✓ icon.svg, icon.png, apple-icon.png, favicon.ico");
