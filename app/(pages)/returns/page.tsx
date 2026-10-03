import type { Metadata } from 'next';
import Prose from '@/components/lux/Prose';
import { store } from '@/data/store';

export const metadata: Metadata = { title: 'Returns & refunds', alternates: { canonical: '/returns' } };

export default function ReturnsPage() {
  return (
    <Prose eyebrow="Policies" title="Returns & refunds" updated="October 2026">
      <p>
        You have <strong>{store.returns.days} days from delivery</strong> to request a return.
      </p>
      <h2>How to return</h2>
      <ul>
        <li>
          Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> with your order ID and the reason.
        </li>
        <li>We&rsquo;ll reply with the return address and instructions. Please don&rsquo;t send anything back before that.</li>
        <li>Send the synth back in its original packaging with all included items.</li>
      </ul>
      <h2>Refunds</h2>
      <p>
        Once the return arrives and we&rsquo;ve checked it, we refund the full product price to your original payment method
        through PayPal, usually within 5 business days.
      </p>
      <h2>Damaged or faulty</h2>
      <p>
        If your FM-1 arrives damaged or stops working within the return window, email us photos or a short video. We&rsquo;ll send
        a replacement or a full refund, and we cover the return shipping.
      </p>
      <h2>Change of mind</h2>
      <p>For change-of-mind returns, return shipping is paid by you. The product must be unused and in resellable condition.</p>
      <h2>PayPal Purchase Protection</h2>
      <p>Eligible purchases are also covered by PayPal&rsquo;s Purchase Protection, under PayPal&rsquo;s own terms.</p>
    </Prose>
  );
}
