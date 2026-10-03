import type { Metadata } from 'next';
import Prose from '@/components/lux/Prose';
import { store } from '@/data/store';

export const metadata: Metadata = { title: 'Terms of sale', alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <Prose eyebrow="Policies" title="Terms of sale" updated="October 2026">
      <p>
        These terms apply to purchases from {store.legalName} (&ldquo;{store.name}&rdquo;, &ldquo;we&rdquo;) on this site. By placing an
        order you agree to them.
      </p>
      <h2>Who we are</h2>
      <p>
        {store.name} is an independent retailer. We are not the manufacturer of the M-VAVE FM-1 and are not affiliated with or endorsed
        by M-VAVE. Product names and trademarks belong to their owners.
      </p>
      <h2>Prices and payment</h2>
      <p>
        Prices are in {store.currency} and include any discount shown. Payment is taken by PayPal when you place your order. Your
        order is confirmed when PayPal confirms payment. The total shown at checkout is the total you pay.
      </p>
      <h2>Product information</h2>
      <p>
        We describe the product using the manufacturer&rsquo;s information and what&rsquo;s visible on the device. Colors on screen
        may differ slightly from the real finish. Features we haven&rsquo;t confirmed are not promised.
      </p>
      <h2>Availability</h2>
      <p>If a color becomes unavailable after you order, we&rsquo;ll offer another color or a full refund.</p>
      <h2>Shipping and returns</h2>
      <p>
        See our <a href="/shipping">shipping policy</a> and <a href="/returns">returns policy</a>, which are part of these terms.
      </p>
      <h2>Warranty and liability</h2>
      <p>
        Your statutory consumer rights are not affected. To the extent the law allows, our liability for any order is limited to
        the amount you paid for it.
      </p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>
      </p>
    </Prose>
  );
}
