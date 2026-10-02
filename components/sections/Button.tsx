import { ArrowRight, ArrowUpRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';
import type { Cta } from './types';

export default function Button({
  cta,
  slot,
  variant = 'solid',
  className = '',
}: {
  cta: Cta;
  slot: string;
  variant?: 'solid' | 'outline' | 'inverse';
  className?: string;
}) {
  const external = /^https?:\/\//.test(cta.href);
  const Icon = external ? ArrowUpRight : ArrowRight;
  const styles = {
    solid: 'bg-brand-accent text-brand-accent-ink hover:brightness-110 shadow-[0_14px_30px_-14px_rgb(var(--accent)/0.8)]',
    outline: 'border-2 border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-brand-bg',
    inverse: 'bg-brand-band-ink text-brand-band hover:brightness-95',
  }[variant];
  return (
    <TrackedLink
      href={cta.href}
      id={cta.id}
      slot={slot}
      sponsored={cta.sponsored}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-extrabold transition hover:-translate-y-0.5 active:translate-y-0 ${styles} ${className}`}
    >
      {cta.label}
      <Icon aria-hidden="true" className="h-5 w-5" />
    </TrackedLink>
  );
}
