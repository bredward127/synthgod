'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, AudioLines, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { colors, formatMoney, store, type ColorId } from '@/data/store';
import { track } from '@/lib/analytics/track';

const photo = colors.filter((c) => c.image);

export default function Hero() {
  const [colorId, setColorId] = useState<ColorId>(photo[0].id);
  const color = photo.find((c) => c.id === colorId) ?? photo[0];
  const stage = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = stage.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
  };
  const onLeave = () => {
    stage.current?.style.setProperty('--rx', '0deg');
    stage.current?.style.setProperty('--ry', '0deg');
  };

  const words = ['FM', 'synthesis,'];
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-10 sm:pt-16">
      {/* Aurora backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[900px] w-[1200px] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/0.22),transparent)] blur-3xl" />
        <div className="absolute -left-40 top-40 h-[500px] w-[500px] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent2)/0.12),transparent)] blur-3xl [animation-delay:-8s]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 text-center">
        <p className="glass mx-auto inline-flex animate-fade-up items-center gap-2 rounded-full px-4 py-1.5 text-xs text-brand-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent2 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent2" />
          </span>
          M-VAVE FM-1 · 6-operator FM synthesizer
        </p>

        <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.75rem,8vw,6.25rem)] font-semibold leading-[0.95] tracking-tightest">
          {words.map((w, i) => (
            <span key={w} className="inline-block animate-fade-up" style={{ animationDelay: `${120 + i * 90}ms` }}>
              {w}&nbsp;
            </span>
          ))}
          <br />
          <span className="inline-block animate-fade-up font-serif font-normal italic tracking-normal text-accent-gradient" style={{ animationDelay: '320ms' }}>
            beautifully&nbsp;
          </span>
          <span className="inline-block animate-fade-up" style={{ animationDelay: '410ms' }}>
            handheld.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-xl animate-fade-up text-[17px] leading-relaxed text-brand-muted [animation-delay:520ms]">
          128 presets, six operators, a color screen and a built-in speaker, in a battery-powered instrument small enough to
          play anywhere. No laptop. No cables.
        </p>

        <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:620ms] sm:flex-row">
          <Link
            href={`/checkout?color=${color.id}`}
            className="btn-primary w-full sm:w-auto"
            onClick={() => track('cta_click', { cta_id: 'hero-buy' })}
          >
            Buy now · {formatMoney(store.product.price)}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#sound" className="btn-ghost w-full sm:w-auto" onClick={() => track('cta_click', { cta_id: 'hero-hear' })}>
            <AudioLines className="h-4 w-4 text-brand-accent2" />
            Hear FM in your browser
          </a>
        </div>

        <ul className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-brand-muted [animation-delay:700ms]">
          <li className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-brand-faint" />
            {store.shipping.price === 0 ? 'Free shipping' : 'Fast shipping'}
          </li>
          <li className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-brand-faint" />
            {store.returns.days}-day returns
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-faint" />
            Secure PayPal checkout
          </li>
        </ul>
      </div>

      {/* Product stage */}
      <div
        ref={stage}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative mx-auto mt-10 max-w-5xl animate-fade-in px-5 [animation-delay:500ms] [perspective:1600px] sm:mt-14"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 animate-glow-pulse rounded-full blur-[90px] transition-colors duration-700"
          style={{ background: `radial-gradient(closest-side, rgb(${color.glow} / 0.55), transparent)` }}
        />
        <div className="animate-float">
          <div
            className="relative aspect-[1400/848] transition-transform duration-300 ease-out [transform-style:preserve-3d]"
            style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
          >
            {photo.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.id}
                src={c.image}
                alt={c.id === color.id ? `M-VAVE FM-1 in ${c.name}: ${c.body}` : ''}
                aria-hidden={c.id !== color.id}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_50px_60px_rgb(0_0_0/0.75)] transition-all duration-700 ease-lux ${
                  c.id === color.id ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'
                }`}
              />
            ))}
          </div>
        </div>
        {/* Reflection floor */}
        <div aria-hidden="true" className="mx-auto mt-2 h-6 w-3/4 rounded-[50%] bg-black/60 blur-xl" />

        <div className="mt-6 flex flex-col items-center gap-3">
          <div role="radiogroup" aria-label="Preview color" className="glass flex items-center gap-2 rounded-full p-1.5">
            {photo.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.id === color.id}
                aria-label={c.name}
                title={c.name}
                onClick={() => {
                  setColorId(c.id);
                  track('select_color', { color: c.id, slot: 'hero' });
                }}
                className={`h-8 w-8 rounded-full transition duration-300 ease-lux ${c.id === color.id ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-brand-bg' : 'opacity-70 hover:opacity-100'}`}
                style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
              />
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted">{color.name}</p>
        </div>
      </div>
    </section>
  );
}
