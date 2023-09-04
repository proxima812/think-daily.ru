import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import serviceWorker from "astrojs-service-worker";

import partytown from "@astrojs/partytown";
import { WEBSITE } from "/src/scripts/params.ts";

// https://astro.build/config
export default defineConfig({
 site: `${WEBSITE.url}`,
//  build: {
//   inlineStylesheets: "auto",
//  },
 redirects: {
  "/reflections/aa": "/reflections/aa/yanvar",
  "/reflections/an": "/reflections/an/yanvar",
  "/reflections/alanon": "/reflections/alanon/yanvar",
  "/reflections/alanonmm": "/reflections/alanonmm/yanvar",
  "/reflections/aa24hours": "/reflections/aa24hours/yanvar",
  "/reflections/aadays": "/reflections/aadays/yanvar",
  "/reflections/lolfc": "/reflections/lolfc/yanvar",
 },
 integrations: [
  tailwind({
   config: {
    applyBaseStyles: false,
   },
  }),
  serviceWorker(),
  mdx(),
  react(),
  sitemap(),
  robotsTxt({
   sitemap: [`${WEBSITE.url}/sitemap-0.xml`, `${WEBSITE.url}/sitemap-index.xml`],
  }),
  partytown(),
 ],
});
