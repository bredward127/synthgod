import type { Metadata } from 'next';
import Prose from '@/components/lux/Prose';
import { store } from '@/data/store';

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <Prose eyebrow="Policies" title="Privacy" updated="October 2026">
      <p>
        This policy explains what {store.legalName} (&ldquo;we&rdquo;) collects when you visit this site or buy from us. Questions:{' '}
        <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>.
      </p>
      <h2>When you buy</h2>
      <p>
        Checkout is handled by PayPal. You enter your payment details with PayPal, not with us, and we never see or store card
        numbers. To fulfil your order, PayPal shares with us your name, email address, shipping address, what you bought and the
        payment status. We use this only to ship your order, contact you about it, handle returns and keep the records the law
        requires. We share your shipping details with the supplier and carrier that deliver your order, and with nobody else.
      </p>
      <p>
        PayPal&rsquo;s own use of your data is covered by{' '}
        <a href="https://www.paypal.com/us/legalhub/privacy-full" target="_blank" rel="noopener noreferrer">
          PayPal&rsquo;s privacy statement
        </a>
        .
      </p>
      <h2>Reviews</h2>
      <p>
        If you send a review, we receive the name, optional order ID, rating and text you enter. We publish the name, rating and
        text only after matching the review to an order, and only because you agreed to it on the form. Ask us any time to remove
        your review.
      </p>
      <h2>Analytics (only if you click Allow)</h2>
      <p>
        Until you click <strong>Allow</strong> on the cookie banner, no analytics are sent. If you allow them, we use Google
        Analytics (with Consent Mode) and Vercel Web Analytics to count page views and a short list of events: which buttons
        were clicked, which color was picked, and whether a checkout was started or completed (color and quantity only). We
        never send names, emails, addresses or payment details to analytics. Page addresses sent to Vercel are trimmed to the
        path plus plain <code>utm_*</code> campaign tags.
      </p>
      <h2>What&rsquo;s stored on your device</h2>
      <p>
        Your cookie choice is saved in your browser&rsquo;s local storage so the banner doesn&rsquo;t reappear. If you allow
        analytics, Google sets its own cookies. Clearing site data resets everything.
      </p>
      <h2>How long we keep data</h2>
      <p>Order records are kept as long as tax and accounting law requires. You can ask us to see, correct or delete your data at the email above.</p>
    </Prose>
  );
}
