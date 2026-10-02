import SectionHeading from './SectionHeading';
import type { IconItem } from './types';

export default function FeatureGrid({ title, subtitle, items }: { title: string; subtitle?: string; items: IconItem[] }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={title} subtitle={subtitle} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title: t, body }) => (
            <li key={t} className="flex gap-4 rounded-3xl border-2 border-brand-line bg-brand-surface p-5">
              {Icon ? (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
              ) : null}
              <div>
                <h3 className="font-display text-lg font-bold text-brand-ink">{t}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-brand-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
