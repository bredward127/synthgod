const ITEMS = ['6 operators', '128 presets', 'Built-in speaker', 'Rechargeable battery', 'Color screen', 'Arpeggiator', 'Sequencer', 'Six effects', 'Mono · Poly · Glide', '4 assignable knobs'];

/** Endless spec ticker. Duplicated list + translateX(-50%) loop. */
export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] py-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" aria-label="Highlights">
      <ul className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <li key={i} aria-hidden={i >= ITEMS.length} className="flex items-center gap-10 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.3em] text-brand-muted">
            {t}
            <span className="h-1 w-1 rounded-full bg-brand-accent" />
          </li>
        ))}
      </ul>
    </div>
  );
}
