import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);

// The video imports the website's resume data (../src/data/resume-data.tsx),
// which uses the site's "@/..." alias.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@": path.resolve(process.cwd(), "..", "src"),
    },
  },
}));
