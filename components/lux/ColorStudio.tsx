'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { colors, defaultColor, formatMoney, store, type ColorId } from '@/data/store';
import { track } from '@/lib/analytics/track';
import ProductImage from './ProductImage';
import Magnetic from './motion/Magnetic';

/** Colorway picker: swipe or tap through finishes; product crossfades with a tinted glow. */
export default function ColorStudio() {
  const [id, setId] = useState<ColorId>(defaultColor);
  const index = colors.findIndex((c) => c.id === id);
  const color = colors[index];
  const start = useRef<{ x: number; y: number } | null>(null);

  const go = (i: number, slot = 'studio') => {
    const next = colors[(i + colors.length) % colors.length];
    setId(next.id);
    track('select_color', { color: next.id, slot });
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="grid lg:grid-cols-[1.6fr_1fr]">
        <div
          className="relative grid min-h-[260px] touch-pan-y select-none place-items-center overflow-hidden px-4 pb-4 pt-10 sm:min-h-[460px] sm:p-10"
          onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const s = start.current;
            start.current = null;
            if (!s) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(index + (dx < 0 ? 1 : -1), 'studio-swipe');
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-[background] duration-700 ease-lux"
            style={{ background: `radial-gradient(60% 60% at 50% 55%, rgb(${color.glow} / 0.35), transparent 70%)` }}
          />
          <p className="absolute left-5 top-4 font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted sm:left-8 sm:top-7">
            {String(index + 1).padStart(2, '0')} / {String(colors.length).padStart(2, '0')}
          </p>
          <div className="relative aspect-[1400/848] w-full">
            {colors.map((c) => (
              <ProductImage
                key={c.id}
                image={c.image}
                alt={c.id === id ? `M-VAVE FM-1 in ${c.name}` : ''}
                aria-hidden={c.id !== id}
                draggable={false}
                className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_40px_50px_rgb(0_0_0/0.7)] transition-all duration-700 ease-lux ${
                  c.id === id ? 'translate-x-0 rotate-0 scale-100 opacity-100' : 'translate-y-3 rotate-[-2deg] scale-[0.94] opacity-0'
                }`}
              />
            ))}
          </div>
          <button type="button" aria-label="Previous color" onClick={() => go(index - 1)} className="glass absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-brand-ink transition hover:bg-white/10 sm:left-5">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next color" onClick={() => go(index + 1)} className="glass absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-brand-ink transition hover:bg-white/10 sm:right-5">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col justify-center border-t border-white/[0.06] p-6 sm:p-10 lg:border-l lg:border-t-0">
          <p className="eyebrow">Finish</p>
          <p key={color.id} className="mt-3 animate-fade-up font-display text-4xl font-semibold tracking-tight text-brand-ink">
            {color.name}
          </p>
          <p key={`${color.id}-b`} className="mt-2 animate-fade-in text-brand-muted">
            {color.body}
          </p>
          <div role="radiogroup" aria-label="Color" className="mt-7 flex flex-wrap gap-3">
            {colors.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.id === id}
                aria-label={`${c.name}${c.available ? '' : ' (sold out)'}`}
                title={c.name}
                onClick={() => go(i)}
                className={`relative h-11 w-11 rounded-full transition duration-300 ease-lux sm:h-12 sm:w-12 ${
                  c.id === id ? 'scale-110 ring-2 ring-white/80 ring-offset-[3px] ring-offset-brand-surface' : 'hover:scale-105'
                } ${c.available ? '' : 'opacity-40'}`}
                style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
              />
            ))}
          </div>
          {color.available ? (
            <Magnetic className="mt-8 w-full">
              <Link href={`/checkout?color=${color.id}`} className="btn-primary w-full" onClick={() => track('cta_click', { cta_id: 'colors-buy' })}>
                Buy in {color.name} · {formatMoney(store.product.price)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          ) : (
            <p className="mt-8 rounded-full border border-white/10 py-4 text-center text-sm text-brand-muted">{color.name} is sold out right now</p>
          )}
          <p className="mt-3 text-center text-xs text-brand-faint">
            {store.shipping.price === 0 ? 'Free shipping' : 'Shipping calculated at checkout'} · {store.returns.days}-day returns
          </p>
        </div>
      </div>
    </div>
  );
}
