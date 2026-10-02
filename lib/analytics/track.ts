import { isEventName, sanitizeParams, type EventName } from './events.ts';
import { readConsent, hasAnalyticsConsent } from './consent.ts';

/**
 * Consent-aware event utility.
 *
 * Every send passes three gates: the event must be on the allowlist, analytics
 * consent must be granted, and the parameters must survive sanitization.
 */

export type TrackResult =
  | { sent: true; event: EventName; params: Record<string, string | number | boolean> }
  | { sent: false; reason: 'unknown_event' | 'no_consent' | 'no_gtag' | 'duplicate' };

export type QaEntry = {
  at: number;
  event: string;
  params: Record<string, unknown>;
  result: TrackResult;
};

/**
 * Deduplication across Next.js client navigations.
 *
 * The key is scoped to the current path, so returning to a page later counts
 * as a genuine new view while a re-render, a Strict Mode double-effect, or a
 * shallow URL change does not.
 */
let currentPath = '';
const firedOnPath = new Set<string>();

export function resetDedupeForPath(path: string): void {
  if (path !== currentPath) {
    currentPath = path;
    firedOnPath.clear();
  }
}

/** Test seam: clear all dedupe state. */
export function __resetDedupe(): void {
  currentPath = '';
  firedOnPath.clear();
}

export function isQaMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NEXT_PUBLIC_ANALYTICS_QA === '1') return true;
  try {
    if (new URLSearchParams(window.location.search).get('analytics_qa') === '1') return true;
    return window.sessionStorage.getItem('sam.analytics.qa') === '1';
  } catch {
    return false;
  }
}

function recordQa(entry: QaEntry): void {
  const w = window as unknown as { __samAnalytics?: QaEntry[] };
  w.__samAnalytics = w.__samAnalytics ?? [];
  w.__samAnalytics.push(entry);
  // eslint-disable-next-line no-console
  console.info(
    `[analytics${entry.result.sent ? '' : ' blocked'}] ${entry.event}`,
    entry.result.sent ? entry.result.params : entry.result,
  );
}

type TrackOptions = {
  /** When set, the event fires at most once per path under this key. */
  once?: boolean;
};

export function track(
  event: string,
  params?: Record<string, unknown>,
  options?: TrackOptions,
): TrackResult {
  const qa = isQaMode();
  const finish = (result: TrackResult): TrackResult => {
    if (qa && typeof window !== 'undefined') {
      recordQa({ at: Date.now(), event, params: params ?? {}, result });
    }
    return result;
  };

  if (!isEventName(event)) return finish({ sent: false, reason: 'unknown_event' });

  if (options?.once) {
    if (firedOnPath.has(event)) return finish({ sent: false, reason: 'duplicate' });
  }

  if (typeof window === 'undefined') return finish({ sent: false, reason: 'no_gtag' });

  if (!hasAnalyticsConsent(readConsent())) {
    return finish({ sent: false, reason: 'no_consent' });
  }

  const clean = sanitizeParams(event, params);
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;

  if (typeof gtag !== 'function') return finish({ sent: false, reason: 'no_gtag' });

  if (options?.once) firedOnPath.add(event);

  gtag('event', event, clean);
  return finish({ sent: true, event, params: clean });
}
