import { Check, Minus } from 'lucide-react';
import SectionHeading from './SectionHeading';

type Cell = string | boolean;

/**
 * Feature comparison. A real table from md up; stacked cards on phones so
 * nothing scrolls sideways. Only compare facts you can verify.
 */
export default function ComparisonTable({
  title,
  subtitle,
  columns,
  rows,
  highlight,
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: Array<{ label: string; values: Cell[] }>;
  /** Index of the column to emphasize. */
  highlight?: number;
}) {
  const render = (v: Cell) =>
    typeof v === 'boolean' ? (
      v ? <Check aria-label="Yes" className="mx-auto h-5 w-5 text-brand-accent2" /> : <Minus aria-label="No" className="mx-auto h-5 w-5 text-brand-muted/60" />
    ) : (
      v
    );
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="mt-10 hidden overflow-hidden rounded-3xl border-2 border-brand-line bg-brand-surface md:block">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="bg-brand-line/40">
                <th className="p-4" />
                {columns.map((c, i) => (
                  <th key={c} className={`p-4 text-center font-display text-lg ${i === highlight ? 'text-brand-accent' : 'text-brand-ink'}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-brand-line">
                  <th scope="row" className="p-4 font-semibold text-brand-ink">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className={`p-4 text-center text-brand-muted ${i === highlight ? 'bg-brand-accent/5 font-semibold text-brand-ink' : ''}`}>
                      {render(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 grid gap-4 md:hidden">
          {columns.map((c, ci) => (
            <div key={c} className={`rounded-3xl border-2 bg-brand-surface p-5 ${ci === highlight ? 'border-brand-accent' : 'border-brand-line'}`}>
              <h3 className="font-display text-xl font-bold text-brand-ink">{c}</h3>
              <dl className="mt-3 divide-y divide-brand-line text-sm">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-4 py-2">
                    <dt className="text-brand-muted">{r.label}</dt>
                    <dd className="text-right font-semibold text-brand-ink">{render(r.values[ci])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
