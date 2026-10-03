'use client';

import { useEffect, useRef, useState } from 'react';
import ProductImage from './ProductImage';

/**
 * Pinned product tour: the FM-1 stays on screen while a spotlight glides to
 * each part of the panel as the matching step scrolls by. Mobile-first: the
 * product pins under the header and the steps scroll beneath it; on desktop
 * it pins beside the steps. Regions are % of the cutout image.
 */
const STEPS = [
  {
    tag: 'Engine',
    title: 'Presets and algorithms, one turn away',
    body: 'Scroll 128 presets with the PRESETS knob, then reshape the sound by swapping the FM algorithm on its own knob.',
    box: { x: 3.5, y: 3.5, w: 23, h: 38 },
  },
  {
    tag: 'Display',
    title: 'A color screen that shows its work',
    body: 'Preset name, the page you’re on and every value you touch, right in the middle of the panel.',
    box: { x: 25.5, y: 5.5, w: 24.5, h: 43 },
  },
  {
    tag: 'Control',
    title: 'Four knobs that follow the screen',
    body: 'KNOB1–4 map to whatever page is showing, so oscillators, envelopes and effects are always under your hand.',
    box: { x: 51.5, y: 3.5, w: 43, h: 19 },
  },
  {
    tag: 'Workflow',
    title: 'Every mode has a button',
    body: 'FX, ENV, LFO, EDIT, ARP, SEQ, PLAY and REC. One press each, no menus to dig through.',
    box: { x: 51.5, y: 25.5, w: 43, h: 27 },
  },
  {
    tag: 'Play',
    title: 'Six operators on the keybed',
    body: 'Soft silicone keys with OP1–OP6, pitch, glide, mono and poly printed right on them. Octave buttons extend the range.',
    box: { x: 2.5, y: 55.5, w: 95, h: 40 },
  },
];

export default function Tour() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-55% 0px -40% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const box = STEPS[active].box;
  return (
    <div className="relative grid gap-0 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
      {/* Pinned stage */}
      <div className="sticky top-[68px] z-10 -mx-5 bg-gradient-to-b from-brand-bg via-brand-bg/95 to-brand-bg/0 px-5 pb-8 pt-3 lg:order-2 lg:top-28 lg:mx-0 lg:self-start lg:bg-none lg:p-0">
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/0.35),transparent)] blur-2xl" />
          <div className="relative aspect-[1400/848]">
            {/* Dimmed panel underneath, full-brightness copy clipped to the active region on top. */}
            <ProductImage
              image="/images/fm1-orange.webp"
              alt="M-VAVE FM-1 control panel"
              className="absolute inset-0 h-full w-full object-contain brightness-[0.38] saturate-[0.6]"
              sizes="(max-width: 1024px) 92vw, 640px"
            />
            <ProductImage
              image="/images/fm1-orange.webp"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_24px_rgb(var(--accent)/0.35)]"
              sizes="(max-width: 1024px) 92vw, 640px"
              style={{
                clipPath: `inset(${box.y}% ${100 - box.x - box.w}% ${100 - box.y - box.h}% ${box.x}% round 12px)`,
                transition: 'clip-path 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute rounded-[12px] ring-2 ring-brand-accent2 transition-all duration-[800ms] ease-lux"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                boxShadow: '0 0 28px 2px rgb(var(--accent2) / 0.45), inset 0 0 18px rgb(var(--accent2) / 0.25)',
              }}
            >
              <span key={active} className="absolute -top-3 left-2 animate-scale-in rounded-full bg-brand-accent2 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-brand-bg sm:text-[10px]">
                {STEPS[active].tag}
              </span>
            </div>
          </div>
        </div>
        {/* Progress */}
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.tag} className={`h-1 rounded-full transition-all duration-500 ease-lux ${i === active ? 'w-8 bg-brand-accent' : 'w-2 bg-white/15'}`} />
          ))}
        </div>
      </div>

      {/* Steps */}
      <ol className="relative lg:order-1">
        {STEPS.map((s, i) => (
          <li
            key={s.tag}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-step={i}
            className="flex min-h-[46vh] items-center py-6 lg:min-h-[70vh]"
          >
            <div className={`transition-all duration-700 ease-lux ${i === active ? 'opacity-100' : 'opacity-30 lg:translate-x-0'}`}>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brand-accent">
                {String(i + 1).padStart(2, '0')} · {s.tag}
              </p>
              <h3 className="mt-3 font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-brand-ink sm:text-4xl">{s.title}</h3>
              <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-brand-muted sm:text-[17px]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
