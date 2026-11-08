/**
 * Public site URL, used for the PDF footer, share previews, canonical links,
 * sitemap and structured data. Always the production domain, including in
 * local and preview builds, so nothing ever points to localhost or a *.github.io preview.
 * Set NEXT_PUBLIC_SITE_URL to override it (no trailing slash).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://florianruen.fr";

/** Build time = last deploy, shown as "last updated" on the page and the PDF. */
export const BUILD_DATE = new Date();
