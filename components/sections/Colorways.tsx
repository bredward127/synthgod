'use client';

import { useState } from 'react';
import { Check, ImageOff } from 'lucide-react';
import Button from './Button';
import SectionHeading from './SectionHeading';
import type { Cta } from './types';

export type ColorwayOption = { id: string; name: string; body: string; image?: string; swatch: [string, string] };

/**
 * Variant picker: swatches switch the photo. The CTA goes to the listing,
 * where the buyer picks the color (one product link serves every variant).
 */
export default function Colorways({
  title,
  subtitle,
  options,
  cta,
  note,
}: {
  title: string;
  subtitle?: string;
  options: ColorwayOption[];
  cta: Cta;
  note?: string;
}) {
  const [activeId, setActiveId] = useState(options[0]?.id);
  const active = options.find((o) => o.id === activeId) ?? options[0];
  return (
    <section id="colors" className="scroll-mt-4 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="mt-10 grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div className="overflow-hidden rounded-3xl bg-white">
            {active.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={active.id}
                src={active.image}
                alt={`M-VAVE FM-1 in ${active.name}: ${active.body}`}
                className="aspect-[16/10] w-full animate-rise-in object-contain"
              />
            ) : (
              <div
                className="grid aspect-[16/10] w-full place-items-center"
                style={{ background: `linear-gradient(135deg, ${active.swatch[0]}, ${active.swatch[1]})` }}
              >
                <span className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-semibold text-white">
                  <ImageOff aria-hidden="true" className="h-4 w-4" />
                  See the {active.name} photo on the listing
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-brand-ink">{active.name}</p>
            <p className="mt-1 text-brand-muted">{active.body}</p>
            <div role="radiogroup" aria-label="Colorway" className="mt-6 flex flex-wrap gap-3">
              {options.map((o) => {
                const selected = o.id === active.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={o.name}
                    title={o.name}
                    onClick={() => setActiveId(o.id)}
                    className={`relative grid h-12 w-12 place-items-center rounded-full border-2 transition ${
                      selected ? 'border-brand-accent scale-110' : 'border-brand-line hover:border-brand-muted'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${o.swatch[0]} 50%, ${o.swatch[1]} 50%)` }}
                  >
                    {selected ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-bg/80">
                        <Check aria-hidden="true" className="h-3 w-3 text-brand-accent" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-8">
              <Button cta={cta} slot="colors" className="w-full sm:w-auto" />
            </div>
            {note ? <p className="mt-3 text-xs text-brand-muted">{note}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
