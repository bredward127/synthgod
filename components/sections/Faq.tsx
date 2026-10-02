import { ChevronDown } from 'lucide-react';
import SectionHeading from './SectionHeading';

/** Native details/summary: accessible and works without JavaScript. Answer real objections. */
export default function Faq({ title = 'Questions', items }: { title?: string; items: Array<{ q: string; a: string }> }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={title} />
        <div className="mt-8 space-y-3">
          {items.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border-2 border-brand-line bg-brand-surface p-5 open:border-brand-accent/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-brand-ink">
                {q}
                <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 leading-relaxed text-brand-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
