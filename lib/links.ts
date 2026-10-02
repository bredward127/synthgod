/**
 * Outbound link building for every archetype.
 *
 * One function decides the final URL for a product, affiliate, or checkout
 * link, so tags and sub-tracking are applied in exactly one place.
 *
 *   amazon   https://www.amazon.com/dp/ASIN or /s?k=query, plus tag= and ascsubtag=
 *   generic  any URL; the network's tracking params go in `params`
 *            (e.g. { ref: 'mysite' }, { aff_id: '123', sub_id: 'hero' })
 */

export type LinkTarget =
  | { kind: 'amazon'; asin?: string; query?: string }
  | { kind: 'url'; url: string };

export type LinkOptions = {
  /** Amazon Associates tag. Ignored for plain URLs. */
  amazonTag?: string;
  /** Sub-tracking parts, joined into ascsubtag (Amazon) or `subParam` (generic). */
  sub?: Array<string | undefined>;
  /** Query parameter that carries `sub` on non-Amazon links, e.g. 'subid'. */
  subParam?: string;
  /** Extra query parameters, applied last. Empty values are skipped. */
  params?: Record<string, string | undefined>;
};

const TAG_RE = /^[A-Za-z0-9-]{1,64}$/;
const ASIN_RE = /^[A-Z0-9]{10}$/;

export function token(value: string | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24);
}

export function subtag(parts: Array<string | undefined>, prefix = 'site'): string {
  return [prefix, ...parts.map(token)].filter(Boolean).join('_').slice(0, 64);
}

export function buildLink(target: LinkTarget, options: LinkOptions = {}): string {
  let url: URL;
  if (target.kind === 'amazon') {
    url =
      target.asin && ASIN_RE.test(target.asin)
        ? new URL(`https://www.amazon.com/dp/${target.asin}`)
        : new URL('https://www.amazon.com/s');
    if (!(target.asin && ASIN_RE.test(target.asin))) url.searchParams.set('k', target.query ?? '');
    const tag = options.amazonTag?.trim();
    if (tag && TAG_RE.test(tag)) url.searchParams.set('tag', tag);
    if (options.sub?.length) url.searchParams.set('ascsubtag', subtag(options.sub));
  } else {
    url = new URL(target.url);
    if (options.sub?.length && options.subParam) url.searchParams.set(options.subParam, subtag(options.sub));
  }
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
