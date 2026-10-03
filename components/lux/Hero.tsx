'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, AudioLines, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { colors, formatMoney, store, type ColorId } from '@/data/store';
import { track } from '@/lib/analytics/track';
import ProductImage from './ProductImage';
import Magnetic from './motion/Magnetic';

const LINE1 = ['FM', 'synthesis,'];

/**
 * Mobile-first hero: on phones the product sits right under the headline so
 * it's in the first screen; on desktop it follows the buttons. The product
 * enters with a 3D rise, floats, tilts toward the mouse and drifts with scroll.
 */
export default function Hero() {
  const [colorId, setColorId] = useState<ColorId>(colors[0].id);
  const color = colors.find((c) => c.id === colorId) ?? colors[0];
  const root = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  // Scroll-linked drift: product lifts and grows slightly, copy fades back.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      root.current?.style.setProperty('--hp', p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const el = tilt.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
  };
  const onLeave = () => {
    tilt.current?.style.setProperty('--rx', '0deg');
    tilt.current?.style.setProperty('--ry', '0deg');
  };

  const pick = (id: ColorId) => {
    setColorId(id);
    track('select_color', { color: id, slot: 'hero' });
  };

  return (
    <section ref={root} className="relative isolate overflow-hidden pb-12 pt-8 sm:pb-16 sm:pt-16" style={{ ['--hp' as string]: 0 }}>
      {/* Backdrop: aurora + grid. Smaller and lighter on phones. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[520px] w-[620px] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/0.24),transparent)] blur-2xl sm:h-[900px] sm:w-[1200px] sm:blur-3xl" />
        <div className="absolute -left-40 top-40 hidden h-[500px] w-[500px] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent2)/0.12),transparent)] blur-3xl [animation-delay:-8s] sm:block" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_25%,black,transparent_70%)] sm:bg-[size:72px_72px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 text-center">
        <p className="glass order-1 inline-flex animate-fade-up items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] text-brand-muted sm:px-4 sm:text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent2 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent2" />
          </span>
          M-VAVE FM-1 · 6-operator FM synthesizer
        </p>

        <h1
          className="order-2 mx-auto mt-5 max-w-4xl font-display text-[clamp(2.6rem,11vw,6.25rem)] font-semibold leading-[0.95] tracking-tightest sm:mt-7"
          style={{ opacity: 'calc(1 - var(--hp) * 0.9)', transform: 'translateY(calc(var(--hp) * 40px))' }}
        >
          <span className="sr-only">FM synthesis, beautifully handheld.</span>
          <span aria-hidden="true">
            {LINE1.map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-top">
                <span className="word-up" style={{ ['--i' as string]: i }}>
                  {w}&nbsp;
                </span>
              </span>
            ))}
            <br />
            <span className="inline-block overflow-hidden pb-[0.12em] pr-[0.06em] align-top">
              <span className="word-up font-serif font-normal italic tracking-normal text-accent-gradient" style={{ ['--i' as string]: 2 }}>
                beautifully&nbsp;
              </span>
            </span>
            <span className="inline-block overflow-hidden pb-[0.08em] align-top">
              <span className="word-up" style={{ ['--i' as string]: 3 }}>
                handheld.
              </span>
            </span>
          </span>
        </h1>

        <p className="order-5 mx-auto mt-6 max-w-xl animate-fade-up text-[16px] leading-relaxed text-brand-muted [animation-delay:600ms] sm:order-3 sm:mt-7 sm:text-[17px]">
          128 presets, six operators, a color screen and a built-in speaker, in a battery-powered instrument small enough to
          play anywhere. No laptop. No cables.
        </p>

        <div className="order-4 mt-5 flex w-full animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:700ms] sm:order-4 sm:mt-9 sm:w-auto sm:flex-row">
          <Magnetic className="w-full sm:w-auto">
            <Link href={`/checkout?color=${color.id}`} className="btn-primary w-full sm:w-auto" onClick={() => track('cta_click', { cta_id: 'hero-buy' })}>
              Buy now · {formatMoney(store.product.price)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
          <a href="#sound" className="btn-ghost w-full sm:w-auto" onClick={() => track('cta_click', { cta_id: 'hero-hear' })}>
            <AudioLines className="h-4 w-4 text-brand-accent2" />
            Play it in your browser
          </a>
        </div>

        <ul className="order-6 mt-6 grid w-full max-w-sm animate-fade-up grid-cols-3 gap-2 text-[11.5px] text-brand-muted [animation-delay:800ms] sm:order-5 sm:flex sm:max-w-none sm:items-center sm:justify-center sm:gap-6 sm:text-[13px]">
          <li className="flex flex-col items-center gap-1 sm:flex-row sm:gap-1.5">
            <Truck className="h-4 w-4 text-brand-faint" />
            {store.shipping.price === 0 ? 'Free shipping' : 'Fast shipping'}
          </li>
          <li className="flex flex-col items-center gap-1 sm:flex-row sm:gap-1.5">
            <RotateCcw className="h-4 w-4 text-brand-faint" />
            {store.returns.days}-day returns
          </li>
          <li className="flex flex-col items-center gap-1 sm:flex-row sm:gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-faint" />
            PayPal checkout
          </li>
        </ul>

        {/* Product stage */}
        <div
          className="order-3 mt-4 w-full max-w-5xl [perspective:1600px] sm:order-6 sm:mt-14"
          style={{ transform: 'translateY(calc(var(--hp) * -50px)) scale(calc(1 + var(--hp) * 0.06))' }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <div className="relative">
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70">
              <div className="light-sweep h-full w-full rounded-full" />
            </div>
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 animate-glow-pulse rounded-full blur-[60px] transition-colors duration-700 sm:blur-[90px]"
              style={{ background: `radial-gradient(closest-side, rgb(${color.glow} / 0.55), transparent)` }}
            />
            <div className="product-in">
              <div className="animate-float">
                <div
                  ref={tilt}
                  className="relative aspect-[1400/848] transition-transform duration-300 ease-out [transform-style:preserve-3d]"
                  style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
                >
                  {colors.map((c, i) => (
                    <ProductImage
                      key={c.id}
                      image={c.image}
                      priority={i === 0}
                      alt={c.id === color.id ? `M-VAVE FM-1 in ${c.name}: ${c.body}` : ''}
                      aria-hidden={c.id !== color.id}
                      className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_40px_50px_rgb(0_0_0/0.75)] transition-all duration-700 ease-lux ${
                        c.id === color.id ? 'scale-100 opacity-100 blur-0' : 'scale-[0.96] opacity-0 blur-sm'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="mx-auto mt-1 h-5 w-3/4 rounded-[50%] bg-black/60 blur-xl" />
          </div>

          <div className="mt-3 flex animate-fade-up flex-col items-center gap-2 [animation-delay:1100ms] sm:mt-6 sm:gap-2.5">
            <div role="radiogroup" aria-label="Preview color" className="glass flex items-center gap-2 rounded-full p-1.5">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={c.id === color.id}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => pick(c.id)}
                  className={`h-9 w-9 rounded-full transition duration-300 ease-lux sm:h-8 sm:w-8 ${
                    c.id === color.id ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-brand-bg' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
                />
              ))}
            </div>
            <p key={color.id} className="animate-fade-in font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted">
              {color.name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
