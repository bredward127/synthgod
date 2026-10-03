import { BadgeCheck, Quote } from 'lucide-react';
import { listingRating, reviews, type Review } from '@/data/reviews';
import Reveal from './Reveal';
import Stars from './Stars';
import ReviewForm from './ReviewForm';

const flag = (cc?: string) => (cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '');

function ReviewCard({ r, delay }: { r: Review; delay: number }) {
  return (
    <Reveal delay={delay} className="card spotlight mb-4 break-inside-avoid p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={r.rating} size={14} />
        <Quote className="h-5 w-5 text-brand-accent/60" />
      </div>
      {r.title ? <p className="mt-4 font-display text-lg font-semibold text-brand-ink">{r.title}</p> : null}
      <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/90">&ldquo;{r.text}&rdquo;</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.06] pt-4 text-sm">
        <span className="font-medium text-brand-ink">{r.name}</span>
        {r.country ? (
          <span className="text-brand-faint" title={r.country}>
            <span aria-hidden="true">{flag(r.country)}</span> {r.country}
          </span>
        ) : null}
        {r.verified ? (
          <span className="inline-flex items-center gap-1 text-xs text-brand-accent2">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
          </span>
        ) : null}
        <span className="ml-auto text-xs text-brand-faint">
          {r.color ? `${r.color} · ` : ''}
          {new Date(`${r.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
        </span>
      </div>
      {r.source === 'aliexpress' ? <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-faint">Reviewed on AliExpress</p> : null}
    </Reveal>
  );
}

/**
 * Real reviews only (data/reviews.ts), each labeled with where it was
 * written, plus the AliExpress listing's overall rating. Nothing is generated.
 */
export default function Reviews() {
  const store = reviews.filter((r) => r.source === 'store');
  const external = reviews.filter((r) => r.source === 'aliexpress');
  const ownAvg = store.length ? store.reduce((s, r) => s + r.rating, 0) / store.length : null;
  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Reveal className="card flex flex-col p-7 sm:p-8">
          {ownAvg !== null ? (
            <div className="mb-8 border-b border-white/[0.06] pb-6">
              <p className="eyebrow">Our customers</p>
              <p className="mt-4 font-display text-6xl font-semibold tracking-tightest text-brand-ink">{ownAvg.toFixed(1)}</p>
              <Stars rating={ownAvg} size={18} className="mt-3" />
              <p className="mt-3 text-sm text-brand-muted">
                {store.length} review{store.length === 1 ? '' : 's'} from people who bought here
              </p>
            </div>
          ) : null}
          {listingRating ? (
            <>
              <p className="eyebrow">Product rating</p>
              <p className="mt-4 font-display text-7xl font-semibold tracking-tightest text-brand-ink">{listingRating.rating.toFixed(1)}</p>
              <Stars rating={listingRating.rating} size={20} className="mt-3" />
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                From {listingRating.count} ratings of the FM-1 on its {listingRating.source}, checked {listingRating.checked}.
              </p>
            </>
          ) : null}
          <div className="mt-8">
            <ReviewForm />
          </div>
        </Reveal>
      </div>

      <div>
        {store.length ? (
          <div className="columns-1 gap-4 md:columns-2">
            {store.map((r, i) => (
              <ReviewCard key={`${r.name}-${r.date}-${i}`} r={r} delay={(i % 4) * 70} />
            ))}
          </div>
        ) : null}
        {external.length ? (
          <>
            <Reveal as="p" className={`eyebrow mb-4 ${store.length ? 'mt-6' : ''}`}>
              {store.length ? 'Also reviewed on AliExpress' : 'What FM-1 owners wrote on AliExpress'}
            </Reveal>
            <div className="columns-1 gap-4 md:columns-2">
              {external.map((r, i) => (
                <ReviewCard key={`${r.name}-${r.date}-${i}`} r={r} delay={(i % 4) * 70} />
              ))}
            </div>
          </>
        ) : null}
        {!reviews.length ? (
          <Reveal className="card grid place-items-center p-10 text-center">
            <Quote className="mx-auto h-8 w-8 text-brand-accent/70" />
            <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-brand-ink">Customer reviews appear here</p>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
