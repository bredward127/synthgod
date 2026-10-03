import Link from 'next/link';
import { store } from '@/data/store';

/** Wordmark: a tiny "operator" glyph (two orbiting dots) + name. */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 rounded-lg ${className}`} aria-label={`${store.name} home`}>
      <span aria-hidden="true" className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#ff7a3d] to-brand-accent shadow-[0_0_24px_-4px_rgb(var(--accent)/0.8)]">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-bg" />
        <span className="absolute inset-0 animate-spin-slow">
          <span className="absolute left-1/2 top-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-accent2" />
        </span>
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-brand-ink">{store.name}</span>
    </Link>
  );
}
