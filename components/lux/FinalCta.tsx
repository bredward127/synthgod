import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatMoney, store } from '@/data/store';
import Reveal from './Reveal';
import Magnetic from './motion/Magnetic';
import ProductImage from './ProductImage';

export default function FinalCta() {
  return (
    <section className="px-5 pb-24 pt-10">
      <Reveal className="card relative mx-auto max-w-6xl overflow-hidden px-5 pb-0 pt-14 text-center sm:px-12 sm:pt-20">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-[radial-gradient(60%_80%_at_50%_100%,rgb(var(--accent)/0.35),transparent)]" />
        <p className="eyebrow relative">Ready when you are</p>
        <h2 className="relative mx-auto mt-5 max-w-3xl font-display text-[clamp(2.2rem,9vw,4.5rem)] font-semibold leading-[1] tracking-tightest text-brand-ink">
          Six operators. <span className="font-serif font-normal italic tracking-normal text-accent-gradient">One beautiful box.</span>
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-[17px] text-brand-muted">128 presets, a speaker and a battery. FM synthesis, wherever you are.</p>
        <div className="relative mt-9 flex justify-center">
          <Magnetic>
            <Link href="/checkout" className="btn-primary">
              Buy now · {formatMoney(store.product.price)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </div>
        <ProductImage image="/images/fm1-orange.webp" alt="" className="relative mx-auto -mb-[14%] mt-12 w-full max-w-2xl drop-shadow-[0_-20px_60px_rgb(255_94_31/0.35)] sm:mt-14" />
      </Reveal>
    </section>
  );
}
