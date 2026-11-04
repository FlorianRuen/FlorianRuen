import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    en: `${SITE_URL}/`,
    fr: `${SITE_URL}/fr`,
    "x-default": `${SITE_URL}/`,
  };
  return [
    { url: languages.en, lastModified: new Date(), alternates: { languages } },
    { url: languages.fr, lastModified: new Date(), alternates: { languages } },
  ];
}
