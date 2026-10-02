import type { Metadata } from 'next';
import { site } from '@/data/site';
import SiteHeader from '@/components/sections/SiteHeader';
import SiteFooter from '@/components/sections/SiteFooter';
import Prose from '@/components/sections/Prose';

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader brand={site.brand} badge={site.badge} />
      <Prose title="Privacy" updated="October 2026">
        <p>This site has no accounts, no forms and no checkout. We never ask for your name, email or payment details.</p>
        <h2>Analytics (only if you click Allow)</h2>
        <p>
          Until you click <strong>Allow</strong> on the cookie banner, no analytics are sent. If you allow them, we use Google
          Analytics (with Consent Mode) and Vercel Web Analytics to count page views and a short list of events:
        </p>
        <ul>
          <li>which on-page button you clicked (for example “hero” or “final”),</li>
          <li>clicks on outbound buy links, with the destination host only (for example aliexpress.com).</li>
        </ul>
        <p>
          Page addresses sent to Vercel are trimmed to the path plus plain <code>utm_*</code> campaign tags. No personal data is
          included.
        </p>
        <h2>What’s stored on your device</h2>
        <p>Your cookie choice is saved in your browser’s local storage so the banner doesn’t reappear. Clearing site data resets it.</p>
        <h2>Buying</h2>
        <p>
          Buy buttons take you to AliExpress. Anything you do there, including your order and payment, is covered by AliExpress’s
          own privacy policy, not ours.
        </p>
      </Prose>
      <SiteFooter brand={site.brand} disclosures={[{ title: 'Affiliate disclosure', body: site.disclosure }]} links={site.footerLinks} />
    </>
  );
}
