'use client';

import { useState } from 'react';
import { PenLine, Star, X } from 'lucide-react';
import { track } from '@/lib/analytics/track';

/** Review submission. Sent to /api/review for moderation; nothing is published automatically. */
export default function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    setError('');
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.get('name'),
        orderId: f.get('orderId'),
        title: f.get('title'),
        text: f.get('text'),
        rating,
        consent: f.get('consent') === 'on',
      }),
    }).catch(() => null);
    if (res?.ok) {
      setState('sent');
      track('review_submit', {});
    } else {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Could not send your review. Please try again.');
      setState('error');
    }
  };

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost w-full !py-3 text-sm">
        <PenLine className="h-4 w-4" /> Write a review
      </button>
    );

  if (state === 'sent')
    return (
      <p className="rounded-2xl border border-brand-accent2/30 bg-brand-accent2/10 p-4 text-sm text-brand-ink">
        Thank you! We read every review and publish it once we&rsquo;ve matched it to an order.
      </p>
    );

  const field = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-brand-faint focus:border-brand-accent/60 focus:outline-none';
  return (
    <form onSubmit={submit} className="animate-scale-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold text-brand-ink">Your review</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 text-brand-muted hover:text-brand-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <fieldset>
        <legend className="sr-only">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={rating === n} onClick={() => setRating(n)}>
              <Star className={`h-6 w-6 transition ${n <= rating ? 'fill-brand-gold text-brand-gold' : 'text-white/20 hover:text-white/40'}`} />
            </button>
          ))}
        </div>
      </fieldset>
      <input name="name" required maxLength={60} placeholder="Name (e.g. Sam K.)" className={field} autoComplete="name" />
      <input name="orderId" maxLength={40} placeholder="PayPal order ID (optional, for the verified badge)" className={field} />
      <input name="title" maxLength={120} placeholder="Title (optional)" className={field} />
      <textarea name="text" required minLength={10} maxLength={1500} rows={4} placeholder="How does it sound? How do you use it?" className={field} />
      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-brand-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-[rgb(var(--accent))]" />
        I bought this product and agree that my review and name as written above may be published on this site.
      </label>
      {state === 'error' ? <p className="text-sm text-[#ff8a7a]">{error}</p> : null}
      <button type="submit" disabled={state === 'sending' || rating === 0} className="btn-primary w-full !py-3 text-sm disabled:opacity-50">
        {state === 'sending' ? 'Sending…' : rating === 0 ? 'Choose a rating' : 'Send review'}
      </button>
    </form>
  );
}
