import { renderOgImage } from "@/lib/og-image";

/**
 * Share preview (/og-en.png). A route with a .png name rather than an
 * opengraph-image file, whose static export has no extension: GitHub Pages
 * picks the content type from the extension, and crawlers expect image/png.
 */
export const dynamic = "force-static";

export function GET() {
  return renderOgImage("en");
}
