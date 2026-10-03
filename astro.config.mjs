import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

// Astro doesn't pass the mode to this file, so read it from the CLI to load the matching .env.<mode>.
const modeFlag = process.argv.indexOf("--mode");
const mode = modeFlag > -1 ? process.argv[modeFlag + 1] : process.argv.includes("dev") ? "development" : "production";
const { SITE_URL } = loadEnv(mode, process.cwd(), "");

export default defineConfig({
  site: SITE_URL || "http://localhost:4321",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
    // three.js (lazy-loaded for the particle stage) is a single ~520 kB chunk on its own
    build: { chunkSizeWarningLimit: 600 },
  },
});
