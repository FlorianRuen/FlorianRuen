/**
 * Static export: `next build` writes the whole site as plain files to out/,
 * deployed to GitHub Pages by .github/workflows/deploy.yml. No server, so
 * every route must be static (route handlers use dynamic = "force-static").
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // No image optimization server on GitHub Pages.
  images: { unoptimized: true },
};

module.exports = nextConfig;
