import type { Metadata } from 'next';
import { site } from '@/data/site';
import SiteHeader from '@/components/sections/SiteHeader';
import SiteFooter from '@/components/sections/SiteFooter';
import Prose from '@/components/sections/Prose';

export const metadata: Metadata = { title: 'Disclosure', alternates: { canonical: '/disclosure' } };

export default function DisclosurePage() {
  return (
    <>
      <SiteHeader brand={site.brand} badge={site.badge} />
      <Prose title="Disclosure" updated="October 2026">
        <h2>Affiliate links</h2>
        <p>
          The buy buttons on this site go to the M-VAVE FM-1 on AliExpress and may be affiliate links. If you buy through one, we
          may earn a commission. You pay the same price. Every such button is marked as an affiliate link and opens in a new tab.
        </p>
        <h2>Independence</h2>
        <p>{site.independence} “M-VAVE” and “FM-1” are names of their respective owner and are used only to identify the product.</p>
        <h2>How we write about the product</h2>
        <p>
          Features on this site come from the product listing and from what is printed on the device in product photos. We don’t
          publish reviews, ratings or testimonials we can’t verify, and we don’t show prices because they change often on
          AliExpress.
        </p>
      </Prose>
      <SiteFooter brand={site.brand} disclosures={[{ title: 'Affiliate disclosure', body: site.disclosure }]} links={site.footerLinks} />
    </>
  );
}
