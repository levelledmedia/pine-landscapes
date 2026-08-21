import { defineConfig } from 'astro/config';

// GitHub Pages serves this as a project site at /pine-landscapes/, so every
// asset/link (via the withBase() helper used throughout src/) needs that
// prefix baked in at build time. Cloudflare Pages serves the same build at
// its own domain root instead, with no prefix — those two hosts need
// different base paths from the identical source, which is why this reads
// CF_PAGES (set to "1" automatically by Cloudflare's build environment,
// https://developers.cloudflare.com/pages/configuration/build-image/#environment-variables)
// rather than hardcoding one host. Deploying somewhere else with its own
// subpath will need its own check added here the same way.
export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  base: process.env.CF_PAGES ? '/' : '/pine-landscapes/',
});
