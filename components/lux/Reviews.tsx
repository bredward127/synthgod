import { BadgeCheck, Quote } from 'lucide-react';
import { listingRating, reviews } from '@/data/reviews';
import Reveal from './Reveal';
import Stars from './Stars';
import ReviewForm from './ReviewForm';

/**
 * Real reviews only (data/reviews.ts) plus the supplier listing's rating,
 * always labeled with its source. Nothing here is generated.
 */
export default function Reviews() {
  const own = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Reveal className="card flex flex-col p-7 sm:p-8">
        {own !== null ? (
          <>
            <p className="eyebrow">Our customers</p>
            <p className="mt-4 font-display text-7xl font-semibold tracking-tightest text-brand-ink">{own.toFixed(1)}</p>
            <Stars rating={own} size={20} className="mt-3" />
            <p className="mt-3 text-sm text-brand-muted">
              Average of {reviews.length} review{reviews.length === 1 ? '' : 's'} from people who bought here
            </p>
          </>
        ) : null}
        {listingRating ? (
          <div className={own !== null ? 'mt-8 border-t border-white/[0.06] pt-6' : ''}>
            <p className="eyebrow">{own !== null ? 'Elsewhere' : 'Product rating'}</p>
            <p className={`mt-4 font-display font-semibold tracking-tightest text-brand-ink ${own !== null ? 'text-4xl' : 'text-7xl'}`}>
              {listingRating.rating.toFixed(1)}
            </p>
            <Stars rating={listingRating.rating} size={own !== null ? 16 : 20} className="mt-3" />
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">
              From {listingRating.count} ratings on the {listingRating.source} for this model, checked {listingRating.checked}.
            </p>
          </div>
        ) : null}
        <div className="mt-auto pt-8">
          <ReviewForm />
        </div>
      </Reveal>

      {reviews.length ? (
        <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4">
          {reviews.map((r, i) => (
            <Reveal key={`${r.name}-${r.date}`} delay={(i % 4) * 70} className="card break-inside-avoid p-6 sm:p-7">
              <Quote className="h-6 w-6 text-brand-accent/70" />
              <Stars rating={r.rating} size={14} className="mt-4" />
              {r.title ? <p className="mt-3 font-display text-lg font-semibold text-brand-ink">{r.title}</p> : null}
              <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">{r.text}</p>
              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand-ink">
                {r.name}
                {r.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-accent2">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
                  </span>
                ) : null}
                <span className="text-xs text-brand-faint">
                  {r.color ? `${r.color} · ` : ''}
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </p>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal delay={100} className="card grid place-items-center p-10 text-center">
          <div className="max-w-md">
            <Quote className="mx-auto h-8 w-8 text-brand-accent/70" />
            <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-brand-ink">Customer reviews appear here</p>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-muted">
              We only publish reviews from people who bought an FM-1 from us, in their own words. Got yours? Tell us how it sounds.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
