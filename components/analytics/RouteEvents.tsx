'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { track, resetDedupeForPath } from '@/lib/analytics/track';
import { CONSENT_GRANTED_EVENT } from '@/lib/analytics/consent';

/**
 * Fires page-view events on navigation, at most once per path, and again
 * when consent is granted so the entry page's view is not lost.
 * Add a branch per page that needs its own view event.
 */
export default function RouteEvents() {
  const pathname = usePathname();

  const fire = useCallback(() => {
    if (pathname === '/quiz') track('view_quiz', {}, { once: true });
  }, [pathname]);

  useEffect(() => {
    resetDedupeForPath(pathname);
    fire();
  }, [pathname, fire]);

  useEffect(() => {
    window.addEventListener(CONSENT_GRANTED_EVENT, fire);
    return () => window.removeEventListener(CONSENT_GRANTED_EVENT, fire);
  }, [fire]);

  return null;
}
