import { defineConfig } from 'astro/config';

// Served from GitHub Pages at /pine-landscapes/ — update this (or drop it
// entirely) if you move to a custom domain or a different host.
export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  base: '/pine-landscapes/',
});
