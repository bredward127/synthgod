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

  // Only Google needs consent; without a Google tag there is nothing to ask about.
  if (decided || !process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim()) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="glass fixed inset-x-3 bottom-3 z-[65] animate-fade-up rounded-3xl bg-brand-surface/80 p-5 shadow-2xl sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-md"
    >
      <h2 id="consent-title" className="font-display text-[15px] font-semibold text-brand-ink">
        Allow Google Analytics?
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-brand-muted">
        We count visits with Vercel Analytics, which uses no cookies and collects no personal data. We&rsquo;d also like to
        use Google Analytics, which sets cookies and receives your IP address and page views. Google stays off unless you
        allow it. Details are on the{' '}
        <Link href="/privacy" className="text-brand-ink underline underline-offset-4">
          privacy page
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => choose(false)} className="btn-ghost flex-1 !py-2.5 text-sm">
          Decline
        </button>
        <button type="button" onClick={() => choose(true)} className="btn-primary flex-1 !py-2.5 text-sm">
          Allow
        </button>
      </div>
    </div>
  );
}
