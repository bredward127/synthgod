const SPECS = ['6 operators', '128 presets', 'Built-in speaker', 'Rechargeable battery', 'Color screen', 'Arpeggiator', 'Sequencer', 'Six effects', 'Mono · Poly · Glide', '4 assignable knobs'];
const SOUNDS = ['Electric pianos', 'Glass bells', 'Punchy basses', 'Wide pads', 'Plucks', 'Wood gongs'];

function Row({ items, reverse = false, accent = false }: { items: string[]; reverse?: boolean; accent?: boolean }) {
  return (
    <ul
      className={`flex w-max gap-8 hover:[animation-play-state:paused] sm:gap-10 ${reverse ? 'animate-marquee [animation-direction:reverse] [animation-duration:46s]' : 'animate-marquee'}`}
    >
      {[...items, ...items].map((t, i) => (
        <li
          key={i}
          aria-hidden={i >= items.length}
          className={`flex items-center gap-8 whitespace-nowrap sm:gap-10 ${
            accent ? 'font-serif text-[22px] italic text-brand-ink/80 sm:text-[28px]' : 'font-mono text-[11px] uppercase tracking-[0.3em] text-brand-muted sm:text-[12px]'
          }`}
        >
          {t}
          <span className={`rounded-full ${accent ? 'h-1.5 w-1.5 bg-brand-accent2' : 'h-1 w-1 bg-brand-accent'}`} />
        </li>
      ))}
    </ul>
  );
}

/** Two endless tickers running in opposite directions: specs, then sounds. */
export default function Marquee() {
  return (
    <div className="relative space-y-4 overflow-hidden border-y border-white/[0.06] py-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] sm:space-y-5 sm:py-6" aria-label="Highlights">
      <Row items={SPECS} />
      <Row items={SOUNDS} reverse accent />
    </div>
  );
}
