import type { LucideIcon } from 'lucide-react';

/** Row of true trust statements ("Free returns", "Ships in 24h"). Never invented counts. */
export default function ProofBar({ items }: { items: Array<{ icon: LucideIcon; label: string }> }) {
  return (
    <section className="px-4 py-6 sm:px-6">
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-2 rounded-2xl bg-brand-line/40 px-3 py-4 text-center text-sm font-semibold text-brand-ink">
            <Icon aria-hidden="true" className="h-5 w-5 text-brand-accent2" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
