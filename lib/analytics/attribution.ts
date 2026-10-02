/**
 * Campaign attribution capture.
 *
 * Captured only after analytics consent is granted, held in sessionStorage
 * (so it disappears when the browser tab closes), and read only when a lead
 * request is submitted. It is never attached to page views, never sent to an
 * ad platform on its own, and never combined with the free-text question on
 * /ask.
 *
 * Retention behavior is documented in docs/measurement-plan.md and described
 * on /privacy. No lead request endpoint exists yet, so nothing is currently
 * persisted server-side.
 */

import { readConsent, hasAnalyticsConsent } from './consent.ts';

export const ATTRIBUTION_STORAGE_KEY = 'sam.attribution.v1';

/** Session-scoped, and additionally expired after this many days. */
export const ATTRIBUTION_MAX_AGE_DAYS = 30;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  capturedAt: string;
};

const VALUE_RE = /^[A-Za-z0-9._~-]{1,120}$/;

export function parseAttribution(search: string, now: Date = new Date()): Attribution | null {
  const params = new URLSearchParams(search);
  const out: Attribution = { capturedAt: now.toISOString() };
  let found = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value && VALUE_RE.test(value)) {
      out[key] = value;
      found = true;
    }
  }

  const gclid = params.get('gclid');
  if (gclid && VALUE_RE.test(gclid)) {
    out.gclid = gclid;
    found = true;
  }

  return found ? out : null;
}

export function isExpired(attribution: Attribution, now: Date = new Date()): boolean {
  const captured = Date.parse(attribution.capturedAt);
  if (Number.isNaN(captured)) return true;
  const ageDays = (now.getTime() - captured) / 86_400_000;
  return ageDays > ATTRIBUTION_MAX_AGE_DAYS;
}

/** Capture from the current URL. No-op without analytics consent. */
export function captureAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  if (!hasAnalyticsConsent(readConsent())) return null;

  const parsed = parseAttribution(window.location.search);
  if (!parsed) return null;

  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* storage unavailable */
  }
  return parsed;
}

/** Read stored attribution, for attaching to a lead request only. */
export function readAttribution(now: Date = new Date()): Attribution | null {
  if (typeof window === 'undefined') return null;
  if (!hasAnalyticsConsent(readConsent())) return null;
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (isExpired(parsed, now)) {
      window.sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}
