'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Reveals every [data-reveal] element as it scrolls into view by adding
 * data-shown (an attribute React never renders, so re-renders can't reset it). Elements stay
 * visible without JS (the hidden state only applies under html.js).
 */
export default function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-shown', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not([data-shown])').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
