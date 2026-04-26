/**
 * Converts any string into a URL-safe slug.
 * Strips accents, lowercases, replaces spaces/symbols with hyphens.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric (except spaces/hyphens)
    .trim()
    .replace(/[\s_]+/g, '-')         // spaces/underscores → hyphens
    .replace(/-{2,}/g, '-')          // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}
