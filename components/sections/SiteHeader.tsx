import Link from 'next/link';
import TrackedLink from '@/components/TrackedLink';
import type { Cta } from './types';

export default function SiteHeader({ brand, badge, home = '/', cta }: { brand: string; badge?: string; home?: string; cta?: Cta }) {
  return (
    <header className="border-b border-brand-line bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={home} className="flex items-center gap-2 rounded-lg">
          <span aria-hidden="true" className="h-8 w-8 rounded-[42%] bg-gradient-to-br from-brand-accent to-brand-accent2" />
          <span className="font-display text-xl font-bold tracking-tight text-brand-ink">{brand}</span>
          {badge ? (
            <span className="hidden rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-accent min-[420px]:inline">
              {badge}
            </span>
          ) : null}
        </Link>
        {cta ? (
          <TrackedLink
            href={cta.href}
            id={cta.id}
            slot="header"
            sponsored={cta.sponsored}
            className="rounded-full px-3 py-2 text-sm font-bold text-brand-ink transition hover:bg-brand-line/60"
          >
            {cta.label}
          </TrackedLink>
        ) : null}
      </div>
    </header>
  );
}
