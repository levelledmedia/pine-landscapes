// A pasted embed code (quote form, reviews widget) is static HTML baked
// straight into the page at build time via set:html — any bare
// `<script src="...">` inside it is genuinely parser-blocking exactly like
// a hand-written one, stalling the rest of the page behind that script's
// own network fetch. Third-party form/embed scripts (see CLAUDE.md's note
// on the shared quote-form embed) don't ship with `async` themselves, so
// this adds it wherever it's missing — safe to do blindly since a script
// tag that's already async/defer, or that has no src at all (an inline
// snippet), is left untouched.
export function withAsyncScripts(html: string): string {
  return html.replace(/<script((?:(?!\b(?:async|defer)\b)[^>])*?\bsrc=)/gi, '<script async$1');
}
