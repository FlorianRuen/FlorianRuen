import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Built once at deploy time (static export for GitHub Pages).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
