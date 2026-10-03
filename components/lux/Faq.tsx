import { Plus } from 'lucide-react';
import Reveal from './Reveal';

export default function Faq({ items }: { items: Array<{ q: string; a: React.ReactNode }> }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {items.map((item, i) => (
        <Reveal key={item.q} delay={i * 40}>
          <details className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-lg font-medium tracking-tight text-brand-ink transition hover:text-white">
              {item.q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 transition duration-500 ease-lux group-open:rotate-45 group-open:border-brand-accent/50 group-open:bg-brand-accent/10">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <div className="animate-fade-in pb-6 pr-12 text-[15px] leading-relaxed text-brand-muted">{item.a}</div>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
