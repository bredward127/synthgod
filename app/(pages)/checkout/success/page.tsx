import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { colorById, store } from '@/data/store';

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } };

export default function SuccessPage({ searchParams }: { searchParams: { order?: string; color?: string; qty?: string; name?: string } }) {
  const order = /^[A-Z0-9]{8,40}$/.test(searchParams.order ?? '') ? searchParams.order : undefined;
  const color = colorById(searchParams.color);
  const qty = Number(searchParams.qty);
  const name = /^[A-Za-z\u00C0-\u024F' -]{1,40}$/.test(searchParams.name ?? '') ? searchParams.name : undefined;
  return (
    <section className="relative overflow-hidden px-5 pb-28 pt-20 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(40%_50%_at_50%_20%,rgb(var(--accent2)/0.15),transparent)]" />
      <span className="mx-auto grid h-16 w-16 animate-scale-in place-items-center rounded-full bg-brand-accent2/15 ring-1 ring-brand-accent2/40">
        <Check className="h-8 w-8 text-brand-accent2" strokeWidth={2.5} />
      </span>
      <h1 className="mx-auto mt-8 max-w-2xl animate-fade-up font-display text-5xl font-semibold tracking-tightest text-brand-ink">
        {name ? `Thank you, ${name}.` : 'Thank you.'} <span className="font-serif font-normal italic text-brand-gold">It&rsquo;s yours.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md animate-fade-up text-[17px] text-brand-muted [animation-delay:120ms]">
        Your payment went through. PayPal has emailed you a receipt, and we&rsquo;ll email tracking as soon as your FM-1 ships.
      </p>
      <div className="card mx-auto mt-10 max-w-md animate-fade-up p-6 text-left [animation-delay:220ms]">
        <dl className="space-y-3 text-sm">
          {order ? (
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Order ID</dt>
              <dd className="font-mono text-brand-ink">{order}</dd>
            </div>
          ) : null}
          {color ? (
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Item</dt>
              <dd className="text-brand-ink">
                FM-1 · {color.name}
                {Number.isInteger(qty) && qty > 0 ? ` × ${qty}` : ''}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-brand-muted">Ships in</dt>
            <dd className="text-brand-ink">{store.shipping.processing}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-8 text-sm text-brand-muted">
        Questions? <a className="text-brand-ink underline underline-offset-4" href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>
      </p>
      <Link href="/" className="btn-ghost mt-8">
        Back to the store
      </Link>
    </section>
  );
}
