// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The live address and base path live ONLY here (PRD Section 5.1).
// If the GitHub organisation name changes, change `site` and the repo name.
export default defineConfig({
  site: 'https://tips-futurepathways.github.io',
  base: '/',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Pages that search engines should not list (PRD 5.4).
      filter: (page) => !/\/(review|search|saved)\/$/.test(page),
    }),
  ],
});
