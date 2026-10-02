import { Check, Package, Star } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';
import SectionHeading from './SectionHeading';
import type { ProductItem } from './types';

/**
 * 1-3 column product cards. `featured` gets the inverted, raised treatment
 * (Best Match / Best Overall). Ratings render only when both figures are set.
 */
export default function ProductGrid({ title, subtitle, products, slot = 'grid' }: { title?: string; subtitle?: string; products: ProductItem[]; slot?: string }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {title ? <SectionHeading title={title} subtitle={subtitle} /> : null}
        <ul className={`mt-10 grid gap-5 md:items-start md:pt-3 ${products.length >= 3 ? 'md:grid-cols-3' : products.length === 2 ? 'md:grid-cols-2' : ''}`}>
          {products.map((p) => {
            const Icon = p.icon ?? Package;
            const f = p.featured;
            return (
              <li
                key={p.id}
                className={`flex flex-col overflow-hidden rounded-3xl ${
                  f
                    ? 'bg-brand-band text-brand-band-ink ring-4 ring-brand-accent2/60 md:-translate-y-3 shadow-2xl'
                    : 'border-2 border-brand-line bg-brand-surface text-brand-ink'
                }`}
              >
                <div className="relative">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover md:aspect-[4/3]" />
                  ) : (
                    <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-brand-accent/15 to-brand-accent2/20 md:aspect-[4/3]">
                      <Icon aria-hidden="true" className="h-14 w-14 text-brand-accent" strokeWidth={1.6} />
                    </div>
                  )}
                  {p.label ? (
                    <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${f ? 'bg-brand-accent2 text-brand-band' : 'bg-brand-surface text-brand-accent'}`}>
                      {p.label}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {p.badge ? <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">{p.badge}</p> : null}
                  <h3 className="mt-1 font-display text-xl font-bold leading-snug">{p.name}</h3>
                  {p.rating !== undefined && p.reviewCount !== undefined ? (
                    <p className="mt-1 flex items-center gap-1 text-sm opacity-80">
                      <Star aria-hidden="true" className="h-4 w-4 fill-current text-brand-accent2" />
                      {p.rating.toFixed(1)} ({p.reviewCount.toLocaleString('en-US')} reviews)
                    </p>
                  ) : null}
                  <p className="mt-3 text-[15px] leading-relaxed opacity-80">{p.description}</p>
                  {p.highlights?.length ? (
                    <ul className="mt-4 space-y-2">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-sm opacity-90">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-accent2/25">
                            <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-auto pt-6">
                    <TrackedLink
                      href={p.cta.href}
                      id={p.id}
                      slot={slot}
                      sponsored={p.cta.sponsored}
                      className={`flex w-full items-center justify-center rounded-full px-5 py-3.5 text-[15px] font-extrabold transition active:scale-[0.98] ${
                        f ? 'bg-brand-accent2 text-brand-band hover:brightness-110' : 'bg-brand-accent text-brand-accent-ink hover:brightness-110'
                      }`}
                    >
                      {p.cta.label}
                    </TrackedLink>
                    {p.ctaNote ? <p className="mt-2 text-center text-xs opacity-60">{p.ctaNote}</p> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
