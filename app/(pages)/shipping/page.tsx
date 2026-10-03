import type { Metadata } from 'next';
import Prose from '@/components/lux/Prose';
import { formatMoney, store } from '@/data/store';

export const metadata: Metadata = { title: 'Shipping', alternates: { canonical: '/shipping' } };

export default function ShippingPage() {
  return (
    <Prose eyebrow="Policies" title="Shipping" updated="October 2026">
      <ul>
        <li>
          <strong>Where we ship:</strong> {store.shipping.countries}.
        </li>
        <li>
          <strong>Cost:</strong> {store.shipping.price === 0 ? 'free on every order' : `${formatMoney(store.shipping.price)} per order`}.
        </li>
        <li>
          <strong>Processing:</strong> orders leave us within {store.shipping.processing}.
        </li>
        <li>
          <strong>Delivery:</strong> usually {store.shipping.delivery} after shipping.
        </li>
      </ul>
      <h2>Tracking</h2>
      <p>When your order ships, we email a tracking link to the address on your PayPal payment.</p>
      <h2>Delays and lost parcels</h2>
      <p>
        If your parcel hasn&rsquo;t arrived within the delivery window, or tracking stops updating, email{' '}
        <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> with your order ID and we&rsquo;ll chase it. If it&rsquo;s
        lost in transit, we&rsquo;ll send a replacement or refund you in full.
      </p>
      <h2>Wrong address</h2>
      <p>We ship to the address on your PayPal payment. If it&rsquo;s wrong, email us before the order ships and we&rsquo;ll fix it.</p>
    </Prose>
  );
}
