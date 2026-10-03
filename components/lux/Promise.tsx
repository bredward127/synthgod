import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { formatMoney, store } from '@/data/store';
import Reveal from './Reveal';

export default function Promise() {
  const items = [
    {
      icon: Truck,
      title: store.shipping.price === 0 ? 'Free shipping' : `Shipping ${formatMoney(store.shipping.price)}`,
      body: `To ${store.shipping.countries}. Ships in ${store.shipping.processing}, arrives in about ${store.shipping.delivery}.`,
    },
    { icon: RotateCcw, title: `${store.returns.days}-day returns`, body: 'Changed your mind? Return it within the window for a refund. See the returns policy for the details.' },
    { icon: ShieldCheck, title: 'Secure checkout', body: 'Pay with your PayPal balance or a card through PayPal. We never see or store your card details.' },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ icon: Icon, title, body }, i) => (
        <Reveal key={title} delay={i * 90} className="card p-7">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <Icon className="h-5 w-5 text-brand-accent2" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-ink">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">{body}</p>
        </Reveal>
      ))}
    </div>
  );
}
