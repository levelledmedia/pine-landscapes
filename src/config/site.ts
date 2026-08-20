// Typed re-export over site.data.json — the studio app edits that JSON file
// directly (business info, colors, fonts, images, page copy). Components
// import from here rather than the JSON so the shape stays typed.
import data from './site.data.json';

export interface ImageValue {
  src: string;
  x?: number;
  y?: number;
  scale?: number;
  inherited?: boolean;
}

export interface GalleryPhoto {
  id: string;
  tag: string | null;
}

export const business = data.business;
export const theme = data.theme;
export const heroVariant = data.heroVariant;
export const swaps = data.swaps;
export const nav = data.nav;
export const footerQuickLinks = data.footerQuickLinks;

// dev-edit.js saves the home-services grid from a contenteditable's
// innerHTML (see Services.astro), which HTML-escapes a literal "&" to
// "&amp;" on save. That round-trips fine wherever the label is rendered via
// EditableText's set:html, but every other place a card's label shows up
// (nav dropdown, footer links, service page title/heading, photo filters)
// interpolates it as plain text, so the escaped entity would otherwise show
// up on the page literally as "&amp;". Decode once here so every consumer
// gets plain text.
function decodeEntities(str: string): string {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
export const homeServices: { id: string; label: string }[][] = data.homeServices.map((row) =>
  row.map((s) => ({ ...s, label: decodeEntities(s.label) })),
);

export const images: Record<string, ImageValue> = data.images;
// Older site.data.json files predate this field.
export const gallery: GalleryPhoto[] = (data as { gallery?: GalleryPhoto[] }).gallery ?? [];
export const content = data.content;
