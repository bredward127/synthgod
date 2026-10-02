/**
 * URL scrubbing for Vercel Web Analytics.
 *
 * Vercel records the full page URL. Only UTM campaign tags are kept, so the
 * dashboard's UTM panel still works while anything else in a query string
 * (a typed search, a gclid, an email in a shared link) never leaves the site.
 */

const KEEP = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']);
const VALUE_RE = /^[A-Za-z0-9._~-]{1,120}$/;

export function scrubUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  const kept = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (KEEP.has(key) && VALUE_RE.test(value)) kept.set(key, value);
  });
  url.search = kept.toString();
  url.hash = '';
  return url.toString();
}
