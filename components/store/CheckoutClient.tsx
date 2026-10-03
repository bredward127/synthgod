'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { CircleAlert, Lock, Minus, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { colors, formatMoney, store, type ColorId } from '@/data/store';
import { quote } from '@/lib/store/pricing';
import ProductImage from '@/components/lux/ProductImage';
import { track } from '@/lib/analytics/track';

function Spinner() {
  return <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-brand-accent" />;
}

function PayPalArea({ color, quantity, onError }: { color: ColorId; quantity: number; onError: (m: string) => void }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const router = useRouter();
  if (isRejected) return <p className="text-sm text-[#ff8a7a]">PayPal couldn&rsquo;t load. Check your connection or disable content blockers, then refresh.</p>;
  return (
    <div className="relative min-h-[120px]">
      {isPending ? (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner />
        </div>
      ) : null}
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 50 }}
        forceReRender={[color, quantity]}
        createOrder={async () => {
          onError('');
          track('begin_checkout', { color, quantity });
          const res = await fetch('/api/paypal/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ color, quantity }),
          });
          const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
          if (!res.ok || !data.id) {
            const message = data.error ?? 'Could not start checkout. Please try again.';
            onError(message);
            throw new Error(message);
          }
          return data.id;
        }}
        onApprove={async (data, actions) => {
          const res = await fetch(`/api/paypal/orders/${data.orderID}/capture`, { method: 'POST' });
          const result = (await res.json().catch(() => ({}))) as { orderId?: string; error?: string; restart?: boolean; firstName?: string };
          if (res.status === 402 && result.restart) {
            onError(result.error ?? 'Your payment method was declined.');
            return actions.restart();
          }
          if (!res.ok || !result.orderId) {
            onError(result.error ?? 'Payment could not be completed. You have not been charged.');
            return;
          }
          track('purchase', { color, quantity });
          const q = new URLSearchParams({ order: result.orderId, color, qty: String(quantity) });
          if (result.firstName) q.set('name', result.firstName);
          router.push(`/checkout/success?${q}`);
        }}
        onCancel={() => onError('')}
        onError={() => onError('Something went wrong with PayPal. You have not been charged. Please try again.')}
      />
    </div>
  );
}

export default function CheckoutClient({ initialColor, paypalClientId }: { initialColor: ColorId; paypalClientId: string }) {
  const [color, setColor] = useState<ColorId>(initialColor);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const selected = colors.find((c) => c.id === color)!;
  const q = useMemo(() => quote({ color, quantity }), [color, quantity]);
  const options = useMemo(() => ({ clientId: paypalClientId, currency: store.currency, intent: 'capture', components: 'buttons' }), [paypalClientId]);

  return (
    <section className="relative px-5 pb-24 pt-10 sm:pt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(50%_60%_at_30%_20%,rgb(var(--accent)/0.12),transparent)]" />
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" /> Secure checkout
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-brand-ink sm:text-5xl">Your FM-1</h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Configure */}
          <div className="card animate-fade-up p-6 sm:p-8">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-3xl bg-black/30">
              <div aria-hidden="true" className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(60% 60% at 50% 55%, rgb(${selected.glow} / 0.35), transparent 70%)` }} />
              <ProductImage
                key={selected.id}
                image={selected.image}
                priority
                alt={`M-VAVE FM-1 in ${selected.name}`}
                className="relative w-[88%] animate-scale-in drop-shadow-[0_30px_40px_rgb(0_0_0/0.7)]"
              />
            </div>

            <fieldset className="mt-8">
              <legend className="flex w-full items-baseline justify-between">
                <span className="eyebrow">Color</span>
                <span className="text-sm text-brand-ink">{selected.name}</span>
              </legend>
              <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!c.available}
                    aria-pressed={c.id === color}
                    onClick={() => {
                      setColor(c.id);
                      track('select_color', { color: c.id, slot: 'checkout' });
                    }}
                    className={`group flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 sm:gap-2 sm:p-3 transition duration-300 ease-lux disabled:cursor-not-allowed disabled:opacity-40 ${
                      c.id === color ? 'border-brand-accent/70 bg-brand-accent/[0.08]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <span className="h-8 w-8 rounded-full ring-1 ring-white/20" style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }} />
                    <span className="text-[11px] text-brand-ink sm:text-xs">{c.name}</span>
                    {!c.available ? <span className="text-[10px] uppercase tracking-wider text-brand-faint">Sold out</span> : null}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-8 flex items-center justify-between">
              <span className="eyebrow">Quantity</span>
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((n) => Math.max(1, n - 1))} className="grid h-9 w-9 place-items-center rounded-full text-brand-ink transition hover:bg-white/10 disabled:opacity-30">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-mono text-sm text-brand-ink" aria-live="polite">
                  {quantity}
                </span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= store.product.maxQuantity} onClick={() => setQuantity((n) => Math.min(store.product.maxQuantity, n + 1))} className="grid h-9 w-9 place-items-center rounded-full text-brand-ink transition hover:bg-white/10 disabled:opacity-30">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Summary + pay */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card animate-fade-up p-6 [animation-delay:120ms] sm:p-8">
              <p className="eyebrow">Order summary</p>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold text-brand-ink">{store.product.name}</p>
                  <p className="mt-0.5 text-sm text-brand-muted">
                    {selected.name} · Qty {quantity}
                  </p>
                </div>
                <p className="font-mono text-sm text-brand-ink">{formatMoney(Number(q.subtotal))}</p>
              </div>
              <dl className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brand-muted">Subtotal</dt>
                  <dd className="font-mono text-brand-ink">{formatMoney(Number(q.subtotal))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-muted">Shipping</dt>
                  <dd className="font-mono text-brand-ink">{Number(q.shipping) === 0 ? 'Free' : formatMoney(Number(q.shipping))}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-white/[0.07] pt-4">
                  <dt className="font-display text-base font-semibold text-brand-ink">Total</dt>
                  <dd className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
                    {formatMoney(Number(q.total))} <span className="text-xs font-normal text-brand-faint">{store.currency}</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-7">
                {paypalClientId ? (
                  <PayPalScriptProvider options={options}>
                    <PayPalArea color={color} quantity={quantity} onError={setError} />
                  </PayPalScriptProvider>
                ) : (
                  <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/[0.06] p-4 text-sm leading-relaxed text-brand-ink">
                    <p className="flex items-center gap-2 font-semibold">
                      <CircleAlert className="h-4 w-4 text-brand-gold" /> Checkout opens soon
                    </p>
                    <p className="mt-1.5 text-brand-muted">
                      Payments aren&rsquo;t switched on yet. Email{' '}
                      <a className="text-brand-ink underline underline-offset-4" href={`mailto:${store.supportEmail}`}>
                        {store.supportEmail}
                      </a>{' '}
                      to order.
                    </p>
                  </div>
                )}
                {error ? (
                  <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#ff8a7a]/30 bg-[#ff8a7a]/[0.07] p-3.5 text-sm text-[#ffb3a8]">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                  </p>
                ) : null}
              </div>

              <ul className="mt-7 space-y-3 border-t border-white/[0.07] pt-6 text-sm text-brand-muted">
                <li className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-brand-accent2" />
                  {store.shipping.price === 0 ? 'Free shipping' : 'Shipping'} · arrives in about {store.shipping.delivery}
                </li>
                <li className="flex items-center gap-3">
                  <RotateCcw className="h-4 w-4 text-brand-accent2" />
                  {store.returns.days}-day returns ·{' '}
                  <Link href="/returns" className="text-brand-ink underline underline-offset-4">
                    policy
                  </Link>
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-brand-accent2" />
                  Paid securely through PayPal. We never see your card.
                </li>
              </ul>
            </div>
            <p className="mt-4 px-2 text-center text-xs leading-relaxed text-brand-faint">
              By paying you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4">
                terms of sale
              </Link>
              . Your shipping address is taken from PayPal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
