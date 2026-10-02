'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { readConsent, hasAnalyticsConsent } from '@/lib/analytics/consent';
import { scrubUrl } from '@/lib/analytics/vercel';

/**
 * Vercel Web Analytics, held to the same rule as Google: nothing is sent
 * until the visitor chooses Allow. Consent is checked on every event, so the
 * choice applies from the next page view onward without a reload. URLs are
 * reduced to the path plus UTM tags before sending.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!hasAnalyticsConsent(readConsent())) return null;
  return { ...event, url: scrubUrl(event.url) };
}

export default function VercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
