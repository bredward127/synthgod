import type { Metadata } from 'next';
import Hero from '@/components/lux/Hero';
import Marquee from '@/components/lux/Marquee';
import Bento from '@/components/lux/Bento';
import Tour from '@/components/lux/Tour';
import SectionTitle from '@/components/lux/SectionTitle';
import LazyFm1 from '@/components/fm1/LazyFm1';
import Link from 'next/link';
import ColorStudio from '@/components/lux/ColorStudio';
import Specs from '@/components/lux/Specs';
import Reviews from '@/components/lux/Reviews';
import Promise from '@/components/lux/Promise';
import Faq from '@/components/lux/Faq';
import FinalCta from '@/components/lux/FinalCta';
import Reveal from '@/components/lux/Reveal';
import StickyBuyBar from '@/components/lux/StickyBuyBar';
import { colors, store } from '@/data/store';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const FAQ = [
  {
    q: 'When will my FM-1 arrive?',
    a: `Orders ship in ${store.shipping.processing} and usually arrive in ${store.shipping.delivery}. You'll get an email with tracking as soon as it ships.`,
  },
  {
    q: 'How do I pay?',
    a: 'Checkout runs on PayPal. Pay with your PayPal balance, or with a debit or credit card through PayPal, where available, without needing a PayPal account. We never see your card details.',
  },
  {
    q: 'What if I don’t love it?',
    a: `You have ${store.returns.days} days from delivery to start a return. See the returns policy for how it works and what's covered.`,
  },
  {
    q: 'Is this the official M-VAVE store?',
    a: `No. ${store.name} is an independent retailer selling the M-VAVE FM-1. We're not affiliated with or endorsed by M-VAVE.`,
  },
  {
    q: 'Does it have MIDI, USB audio or a headphone output?',
    a: `We only list features we've confirmed, and the manufacturer's listing doesn't spell out connectivity. If you need a particular port, email ${store.supportEmail} before ordering and we'll check for you.`,
  },
  {
    q: 'How long does the battery last?',
    a: 'A rechargeable battery is built in and included, but the manufacturer doesn’t publish a runtime, so we won’t guess one.',
  },
  {
    q: 'Is FM hard to learn?',
    a: 'You don’t need to program anything to start: play the 128 presets, then turn the four assignable knobs and the algorithm knob to hear what each one does. Try the browser demo above to get a feel for it.',
  },
  {
    q: 'Which colors are available?',
    a: `${colors.filter((c) => c.available).map((c) => c.name).join(', ')}. Pick yours at checkout.`,
  },
];

export default function Home() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: store.product.name,
    brand: { '@type': 'Brand', name: 'M-VAVE' },
    image: colors.filter((c) => c.image).map((c) => c.image),
    description: '6-operator FM synthesizer with 128 presets, color screen, built-in speaker and rechargeable battery.',
    offers: {
      '@type': 'Offer',
      price: store.product.price.toFixed(2),
      priceCurrency: store.currency,
      availability: 'https://schema.org/InStock',
      url: '/checkout',
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <Hero />
      <Marquee />

      <section id="tour" className="scroll-mt-24 px-5 pt-20 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle eyebrow="Panel tour" title="Every control," accent="exactly where you need it." />
          <div className="mt-8 sm:mt-14">
            <Tour />
          </div>
        </div>
      </section>

      <Bento />

      <section id="sound" className="scroll-mt-24 px-4 py-20 sm:px-5 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Play it"
            title="The whole panel,"
            accent="in your browser."
            body="Turn the knobs, flip through the screen pages, run the arpeggiator. Our virtual FM-1 has a 6-operator engine, six effects and 26 demo patches."
          />
          <Reveal delay={120} className="mt-10 sm:mt-14">
            <LazyFm1 />
          </Reveal>
          <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-brand-faint">
            A simulation we built, not M-VAVE&rsquo;s firmware or factory presets.{' '}
            <Link href="/play" className="text-brand-ink underline underline-offset-4">
              Open the full instrument and controls guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="colors" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle eyebrow="Five finishes" title="Pick the one that" accent="sounds like you." />
          <Reveal delay={120} className="mt-14">
            <ColorStudio />
          </Reveal>
        </div>
      </section>

      <section id="specs" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionTitle align="left" eyebrow="Spec sheet" title="The" accent="details." body="Only what the manufacturer lists and what's printed on the panel. No guesses." />
          </div>
          <Specs />
        </div>
      </section>

      <section id="reviews" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle eyebrow="Reviews" title="What players" accent="say." />
          <div className="mt-14">
            <Reviews />
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <Promise />
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle eyebrow="FAQ" title="Questions," accent="answered." />
          <div className="mt-14">
            <Faq items={FAQ} />
          </div>
        </div>
      </section>

      <FinalCta />
      <StickyBuyBar />
    </>
  );
}
