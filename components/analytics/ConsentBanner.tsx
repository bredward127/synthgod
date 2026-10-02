'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  readConsent,
  writeConsent,
  applyConsentToGtag,
  CONSENT_GRANTED_EVENT,
  type ConsentState,
} from '@/lib/analytics/consent';
import { captureAttribution } from '@/lib/analytics/attribution';

/**
 * Cookie consent banner.
 *
 * Nothing is measured until someone chooses. Consent Mode defaults are set to
 * denied in the document before gtag.js loads, so declining is the state the
 * page starts in rather than something applied afterwards.
 */
export default function ConsentBanner() {
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      applyConsentToGtag(existing);
      if (existing.analytics === 'granted') captureAttribution();
      setDecided(true);
    } else {
      setDecided(false);
    }
  }, []);

  function choose(granted: boolean) {
    const state: ConsentState = {
      analytics: granted ? 'granted' : 'denied',
      ads: granted ? 'granted' : 'denied',
      decidedAt: new Date().toISOString(),
    };
    writeConsent(state);
    applyConsentToGtag(state);
    if (granted) {
      captureAttribution();
      // Let the route tracker record the page they were on when they allowed it.
      window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT));
    }
    setDecided(true);
  }

  if (decided) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-300 bg-white p-4 shadow-lg sm:p-5"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="consent-title" className="text-sm font-semibold text-plum">
            Measurement is off unless you turn it on
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-plum-muted">
            We would like to use Google Analytics and Google Ads measurement to see which pages are
            useful. It sets cookies and shares your IP address and page views with Google. Nothing
            is measured until you choose, and declining costs you nothing on this site. Details are
            on the{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-plum">
              privacy page
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-full border border-plum px-5 py-2.5 text-sm font-semibold text-plum hover:bg-cream-200"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum/90"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
