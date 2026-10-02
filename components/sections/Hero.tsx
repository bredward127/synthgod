import { Diamond } from 'lucide-react';
import Button from './Button';
import type { Cta } from './types';

/**
 * Centered hero. `accent` is the one phrase inside `title` that gets the
 * accent color. `bullets` must be true, checkable statements.
 */
export default function Hero({
  eyebrow,
  title,
  accent,
  subtitle,
  cta,
  secondary,
  bullets = [],
  imageUrl,
  imageAlt = '',
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle: string;
  cta: Cta;
  secondary?: Cta;
  bullets?: string[];
  imageUrl?: string;
  imageAlt?: string;
}) {
  const parts = accent && title.includes(accent) ? title.split(accent) : [title];
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-12 text-center sm:px-6 sm:pt-16">
      <span aria-hidden="true" className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-brand-accent2/20 blur-3xl" />
      <span aria-hidden="true" className="absolute -right-24 top-32 h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        {eyebrow ? (
          <p className="inline-flex rounded-full bg-brand-surface px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-accent shadow-sm">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-6xl">
          {parts.length === 2 ? (
            <>
              {parts[0]}
              <span className="text-brand-accent">{accent}</span>
              {parts[1]}
            </>
          ) : (
            title
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-muted">{subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button cta={cta} slot="hero" />
          {secondary ? <Button cta={secondary} slot="hero" variant="outline" /> : null}
        </div>
        {bullets.length ? (
          <ul className="mt-8 flex flex-col items-center gap-3 text-sm font-bold uppercase tracking-wide text-brand-muted sm:flex-row sm:justify-center sm:gap-6">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Diamond aria-hidden="true" className="h-3 w-3 fill-brand-accent2 text-brand-accent2" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={imageAlt} className="mx-auto mt-10 w-full max-w-2xl rounded-3xl object-cover shadow-xl" />
        ) : null}
      </div>
    </section>
  );
}
