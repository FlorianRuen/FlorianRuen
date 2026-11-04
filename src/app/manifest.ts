import type { MetadataRoute } from "next";
import { RESUME_DATA } from "@/data/resume-data";

/** Web app manifest: name, colours and icon when the site is saved to a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${RESUME_DATA.name} · ${RESUME_DATA.headline.en}`,
    short_name: RESUME_DATA.name,
    description: RESUME_DATA.seoDescription.en,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
