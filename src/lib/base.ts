// Astro's `base` config (see astro.config.mjs — set to ASTRO_BASE at build
// time, only ever non-"/" for a GitHub Pages preview build, which is
// published under /<repo>/<slug>/ rather than domain root) isn't applied
// automatically to hand-written absolute paths — only to Astro's own
// generated asset links. Every hardcoded "/..." href or image src in this
// codebase (nav, footer, breadcrumbs, service links, uploaded images) needs
// to go through this so it still resolves once deployed under a subpath.
// Relative paths, fragments, and external URLs are returned unchanged.
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = import.meta.env.BASE_URL ?? '/';
  return base.replace(/\/$/, '') + path;
}
