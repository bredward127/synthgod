/**
 * The complete set of events this site is allowed to send, and the exact
 * parameters each one may carry.
 *
 * This is an allowlist, not a suggestion. `sanitizeParams` drops anything not
 * declared here, so adding a parameter to a call site without adding it below
 * means it is silently discarded rather than leaked to an ad platform.
 */

export const EVENT_NAMES = [
  'view_quiz',
  'quiz_start',
  'quiz_step',
  'quiz_complete',
  'affiliate_click',
  'cta_click',
  'outbound_click',
  'lead_submit',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/**
 * Parameter value kinds we are willing to transmit.
 * - `enum`: one of a fixed, non-identifying vocabulary
 * - `slug`: a short public identifier (a provider slug, a resource id)
 * - `host`: an external hostname, never a full URL with a query string
 * - `bool`: a flag, used instead of sending the value itself
 * - `count`: a small non-negative integer
 */
type ParamKind = 'enum' | 'slug' | 'host' | 'bool' | 'count';

export const EVENT_PARAMS: Record<EventName, Record<string, ParamKind>> = {
  // Individual answers are never sent: audience questions can touch on
  // health (stress, anxiety, ADHD). Only the step number and the resulting
  // profile (a fixed vocabulary) leave the site.
  view_quiz: {},
  quiz_start: {},
  quiz_step: { step: 'count' },
  quiz_complete: { persona: 'enum' },
  affiliate_click: { product_id: 'slug', slot: 'enum', persona: 'enum', destination_host: 'host' },
  // Any archetype: an on-page CTA, an outbound product/checkout link, a lead form.
  cta_click: { cta_id: 'slug' },
  outbound_click: { link_id: 'slug', slot: 'enum', destination_host: 'host' },
  // The form id only. Never names, emails, phone numbers or message text.
  lead_submit: { form_id: 'slug' },
};

export function isEventName(value: unknown): value is EventName {
  return typeof value === 'string' && (EVENT_NAMES as readonly string[]).includes(value);
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ENUM_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/;
const HOST_RE = /^[a-z0-9.-]{1,100}$/;

/**
 * Patterns that must never reach an analytics destination, checked regardless
 * of which parameter they appear in.
 */
const PII_PATTERNS: readonly RegExp[] = [
  /[^\s@]+@[^\s@]+\.[^\s@]+/, // email address
  /(?:\d[\s().+-]*){10,}/, // phone-like digit run, separators of any width
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN shape
];

export function looksLikePii(value: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(value));
}

function validValue(kind: ParamKind, value: unknown): boolean {
  switch (kind) {
    case 'bool':
      return typeof value === 'boolean';
    case 'count':
      return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10000;
    case 'slug':
      return typeof value === 'string' && SLUG_RE.test(value) && !looksLikePii(value);
    case 'enum':
      return typeof value === 'string' && ENUM_RE.test(value) && !looksLikePii(value);
    case 'host':
      return typeof value === 'string' && HOST_RE.test(value) && !looksLikePii(value);
    default:
      return false;
  }
}

/**
 * Reduce an arbitrary object to only the declared, well-formed parameters for
 * this event. Unknown keys and malformed values are dropped rather than
 * coerced, so a mistake at a call site loses data instead of leaking it.
 */
export function sanitizeParams(
  event: EventName,
  params: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> {
  const allowed = EVENT_PARAMS[event];
  const out: Record<string, string | number | boolean> = {};
  if (!params) return out;

  for (const [key, value] of Object.entries(params)) {
    const kind = allowed[key];
    if (!kind) continue;
    if (value === undefined || value === null || value === '') continue;
    if (!validValue(kind, value)) continue;
    out[key] = value as string | number | boolean;
  }
  return out;
}

/** Extract a bare hostname from a URL, or null. Never returns a query string. */
export function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return HOST_RE.test(host) ? host : null;
  } catch {
    return null;
  }
}
