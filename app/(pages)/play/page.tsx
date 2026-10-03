import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LazyFm1 from '@/components/fm1/LazyFm1';
import Guide from '@/components/fm1/Guide';
import SectionTitle from '@/components/lux/SectionTitle';
import { formatMoney, store } from '@/data/store';

export const metadata: Metadata = {
  title: 'Play the virtual FM-1',
  description: 'A playable browser simulation of the M-VAVE FM-1: working knobs, screen pages, 6-operator FM engine, effects, arpeggiator and sequencer.',
  alternates: { canonical: '/play' },
};

export default function PlayPage() {
  return (
    <>
      <section className="px-4 pb-10 pt-10 sm:px-5 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle eyebrow="Virtual FM-1" title="Play it before" accent="it ships." body="Every knob, button and screen page works. Tap a key to start the sound." />
          <div className="mt-10 sm:mt-14">
            <LazyFm1 />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-brand-faint">
            A browser simulation we built to show how the FM-1 works. Sounds come from our own 6-operator FM engine and 26 demo
            patches, not M-VAVE&rsquo;s firmware or its 128 factory presets, so the real instrument will sound and behave differently.
          </p>
        </div>
      </section>
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <Guide />
          <div className="mt-12 flex justify-center">
            <Link href="/checkout" className="btn-primary">
              Get the real FM-1 · {formatMoney(store.product.price)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
