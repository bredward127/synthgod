/**
 * Consent state.
 *
 * Default is denied. Google Consent Mode defaults are set in the document
 * before gtag.js loads, so nothing is stored or sent until someone chooses.
 */

export type ConsentChoice = 'granted' | 'denied';
export type ConsentState = { analytics: ConsentChoice; ads: ConsentChoice; decidedAt: string };

export const CONSENT_STORAGE_KEY = 'sam.consent.v1';

/** Dispatched on the window when analytics consent is granted. */
export const CONSENT_GRANTED_EVENT = 'sam:consent-granted';

export const DENIED_STATE: ConsentState = {
  analytics: 'denied',
  ads: 'denied',
  decidedAt: '',
};

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.analytics !== 'granted' && parsed.analytics !== 'denied') return null;
    if (parsed.ads !== 'granted' && parsed.ads !== 'denied') return null;
    return {
      analytics: parsed.analytics,
      ads: parsed.ads,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : '',
    };
  } catch {
    // Private mode, blocked storage, or corrupt value: treat as undecided.
    return null;
  }
}

export function writeConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable. The choice applies to this page view only.
  }
}

export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

export function hasAnalyticsConsent(state: ConsentState | null): boolean {
  return state?.analytics === 'granted';
}

/** Push the choice into Google Consent Mode. No-op when gtag is absent. */
export function applyConsentToGtag(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('consent', 'update', {
    analytics_storage: state.analytics,
    ad_storage: state.ads,
    ad_user_data: state.ads,
    ad_personalization: state.ads,
  });
}
