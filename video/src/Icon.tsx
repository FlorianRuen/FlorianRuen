import { AbsoluteFill } from "remotion";

/**
 * The site icon (favicon, apple-touch-icon): an "FR" monogram drawn with
 * strokes, so it stays crisp at 16 px, on the site's blue → violet gradient,
 * with the terminal cursor used across the site. Rendered to PNG/ICO by
 * scripts/make-icons.mjs; the same SVG is served as src/app/icon.svg.
 */
export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d4ed8"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#bg)"/>
  <g fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 47V17h15M14 31h12"/>
    <path d="M36 47V17h8a7.5 7.5 0 0 1 0 15h-8M44 32l7 15"/>
  </g>
  <rect x="14" y="52" width="10" height="4" rx="2" fill="#22d3ee"/>
</svg>`;

export const Icon: React.FC<{ full?: boolean }> = ({ full = false }) => (
  <AbsoluteFill style={{ background: full ? "#1d4ed8" : "transparent" }}>
    <img
      alt=""
      src={`data:image/svg+xml;utf8,${encodeURIComponent(full ? ICON_SVG.replace('rx="14"', 'rx="0"') : ICON_SVG)}`}
      style={{ width: "100%", height: "100%" }}
    />
  </AbsoluteFill>
);
