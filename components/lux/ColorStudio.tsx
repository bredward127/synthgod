'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { colors, defaultColor, formatMoney, store, type ColorId } from '@/data/store';
import { track } from '@/lib/analytics/track';

/** Big colorway picker: crossfading product, tinted glow, and a buy button for the chosen color. */
export default function ColorStudio() {
  const [id, setId] = useState<ColorId>(defaultColor);
  const color = colors.find((c) => c.id === id)!;
  return (
    <div className="card overflow-hidden p-0">
      <div className="grid lg:grid-cols-[1.6fr_1fr]">
        <div className="relative grid min-h-[300px] place-items-center overflow-hidden p-6 sm:min-h-[460px] sm:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-[background] duration-700 ease-lux"
            style={{ background: `radial-gradient(60% 60% at 50% 55%, rgb(${color.glow} / 0.35), transparent 70%)` }}
          />
          <div className="relative aspect-[1400/848] w-full">
            {colors.map((c) =>
              c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.id}
                  src={c.image}
                  alt={c.id === id ? `M-VAVE FM-1 in ${c.name}` : ''}
                  aria-hidden={c.id !== id}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_40px_50px_rgb(0_0_0/0.7)] transition-all duration-700 ease-lux ${
                    c.id === id ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.96] opacity-0'
                  }`}
                />
              ) : null,
            )}
            {!color.image ? (
              <div
                className="absolute inset-[6%] grid animate-scale-in place-items-center rounded-[28px] shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${color.swatch[0]}, ${color.swatch[1]})` }}
              >
                <p className="rounded-full bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur">{color.name}: photo coming soon</p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-white/[0.06] p-6 sm:p-10 lg:border-l lg:border-t-0">
          <p className="eyebrow">Finish</p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-brand-ink">{color.name}</p>
          <p className="mt-2 text-brand-muted">{color.body}</p>
          <div role="radiogroup" aria-label="Color" className="mt-8 grid grid-cols-6 gap-2.5">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.id === id}
                aria-label={`${c.name}${c.available ? '' : ' (sold out)'}`}
                title={c.name}
                onClick={() => {
                  setId(c.id);
                  track('select_color', { color: c.id, slot: 'studio' });
                }}
                className={`relative aspect-square rounded-full transition duration-300 ease-lux ${
                  c.id === id ? 'scale-110 ring-2 ring-white/80 ring-offset-[3px] ring-offset-brand-surface' : 'hover:scale-105'
                } ${c.available ? '' : 'opacity-40'}`}
                style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
              />
            ))}
          </div>
          {color.available ? (
            <Link href={`/checkout?color=${color.id}`} className="btn-primary mt-9 w-full" onClick={() => track('cta_click', { cta_id: 'colors-buy' })}>
              Buy in {color.name} · {formatMoney(store.product.price)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <p className="mt-9 rounded-full border border-white/10 py-4 text-center text-sm text-brand-muted">{color.name} is sold out right now</p>
          )}
          <p className="mt-3 text-center text-xs text-brand-faint">
            {store.shipping.price === 0 ? 'Free shipping' : 'Shipping calculated at checkout'} · {store.returns.days}-day returns
          </p>
        </div>
      </div>
    </div>
  );
}
