import SectionHeading from './SectionHeading';
import type { IconItem } from './types';

/** "Pick the one that stings" style: 2-4 pain points, then the answer. Keep claims modest. */
export default function ProblemSolution({ title, subtitle, problems, solution }: { title: string; subtitle?: string; problems: IconItem[]; solution: { title: string; body: string } }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={title} subtitle={subtitle} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {problems.map(({ icon: Icon, title: t, body }) => (
            <li key={t} className="rounded-3xl border-2 border-brand-line bg-brand-surface p-6">
              {Icon ? <Icon aria-hidden="true" className="h-7 w-7 text-brand-accent" /> : null}
              <h3 className="mt-3 font-display text-xl font-bold text-brand-ink">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">{body}</p>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-brand-accent/10 p-6 text-center">
          <h3 className="font-display text-2xl font-bold text-brand-ink">{solution.title}</h3>
          <p className="mt-2 leading-relaxed text-brand-ink/80">{solution.body}</p>
        </div>
      </div>
    </section>
  );
}
