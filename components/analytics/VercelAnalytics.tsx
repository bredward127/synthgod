'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { scrubUrl } from '@/lib/analytics/vercel';

/**
 * Vercel Web Analytics: cookieless, no personal data, so it counts every
 * visit (Google, which sets cookies, stays behind the consent banner).
 * URLs are reduced to the path plus UTM tags before sending, so query
 * strings like a PayPal order ID on /checkout/success never leave the site.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return { ...event, url: scrubUrl(event.url) };
}

export default function VercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
