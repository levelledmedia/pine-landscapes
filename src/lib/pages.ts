// Single source of truth for a nav item's current URL, looked up by its
// stable `key` (not its label, which is what's actually renameable — see
// Header.astro). Every internal link to Projects/About/Contact/Home should
// resolve through this instead of hardcoding a path, so renaming a nav label
// (which re-slugifies nav[].href, see dev-edit.js's initNavSlugSync) doesn't
// leave stale literals scattered around the codebase.
import { nav } from '../config/site';

export function pageHref(key: string): string {
  return nav.find((item) => item.key === key)?.href ?? '/';
}

// Turns a label into a clean URL segment ("Fencing & Gates" -> "fencing-gates").
// Mirrors dev-edit.js's client-side slugifyLabel (nav rename -> URL slug) —
// duplicated rather than shared since one runs server-side at build/dev
// time and the other in the browser, but keep the two in sync if either
// changes.
export function slugifyLabel(text: string): string {
  return (
    text
      .replace(/<[^>]*>/g, ' ')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'page'
  );
}

// A service card's page lives at a flat, clean URL derived from its current
// label ("/fencing"), not nested under /services/ or keyed by its internal
// id ("/services/svc-fencing") — the "Services" nav item is just a dropdown
// trigger, never a real page itself.
export function serviceHref(label: string): string {
  return '/' + slugifyLabel(label);
}
