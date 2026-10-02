import type { Metadata } from 'next';
import { site } from '@/data/site';
import { buyHref, colorways, landing } from '@/data/landing';
import SiteHeader from '@/components/sections/SiteHeader';
import Hero from '@/components/sections/Hero';
import ProofBar from '@/components/sections/ProofBar';
import ProblemSolution from '@/components/sections/ProblemSolution';
import FeatureGrid from '@/components/sections/FeatureGrid';
import DarkBand from '@/components/sections/DarkBand';
import Colorways from '@/components/sections/Colorways';
import ComparisonTable from '@/components/sections/ComparisonTable';
import HowItWorks from '@/components/sections/HowItWorks';
import Faq from '@/components/sections/Faq';
import PromiseBox from '@/components/sections/PromiseBox';
import FinalCta from '@/components/sections/FinalCta';
import SiteFooter from '@/components/sections/SiteFooter';

export const metadata: Metadata = {
  title: { absolute: `M-VAVE FM-1: a handheld 6-operator FM synth | ${site.brand}` },
  description: landing.hero.subtitle,
  alternates: { canonical: '/' },
  openGraph: { images: [{ url: '/images/fm1-orange.jpg', width: 1600, height: 1000 }] },
};

/** Archetype: single-product landing page (product-site-builder). */
export default function ProductLanding() {
  return (
    <>
      <SiteHeader brand={site.brand} badge={site.badge} cta={{ ...landing.hero.cta, id: 'header', label: 'Check price' }} />
      <Hero {...landing.hero} />
      <ProofBar items={landing.proof} />
      <ProblemSolution {...landing.problem} />
      <FeatureGrid title="What’s on the panel" items={landing.features} />
      <DarkBand {...landing.band} />
      <Colorways
        title="Pick your colorway"
        subtitle="Six finishes, same synth."
        options={colorways}
        cta={{ label: 'Choose a color on AliExpress', href: buyHref('colors'), id: 'colors', sponsored: true }}
        note="Affiliate link · you pick the color on the AliExpress page. Availability varies by color."
      />
      <ComparisonTable {...landing.specs} />
      <div id="how" className="scroll-mt-4">
        <HowItWorks steps={landing.steps} />
      </div>
      <Faq items={landing.faq} />
      <PromiseBox {...landing.promise} />
      <FinalCta {...landing.final} />
      <SiteFooter
        brand={site.brand}
        disclosures={[
          { title: 'Affiliate disclosure', body: site.disclosure },
          { title: 'Independent site', body: site.independence },
        ]}
        links={site.footerLinks}
      />
    </>
  );
}
