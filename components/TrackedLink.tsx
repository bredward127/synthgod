'use client';

import { hostOf } from '@/lib/analytics/events';
import { track } from '@/lib/analytics/track';

type Props = {
  href: string;
  /** Short slug for analytics, e.g. 'hero' or a product id. */
  id: string;
  /** Where on the page: 'hero', 'grid', 'table', 'final'... */
  slot?: string;
  /** Paid/affiliate link: opens a new tab with rel="sponsored". */
  sponsored?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * A link that reports its click through the consent-aware tracker.
 * Internal or anchor links fire cta_click; outbound links fire outbound_click.
 */
export default function TrackedLink({ href, id, slot = 'body', sponsored, className, children }: Props) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: sponsored ? 'sponsored noopener noreferrer' : 'noopener noreferrer' } : {})}
      onClick={() =>
        external
          ? track('outbound_click', { link_id: id, slot, destination_host: hostOf(href) ?? undefined })
          : track('cta_click', { cta_id: id })
      }
    >
      {children}
    </a>
  );
}
