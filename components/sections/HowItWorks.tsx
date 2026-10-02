import SectionHeading from './SectionHeading';

export default function HowItWorks({ title = 'How it works', steps }: { title?: string; steps: Array<{ title: string; body: string }> }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={title} />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-3xl border-2 border-brand-line bg-brand-surface p-6">
              <p className="font-display text-4xl font-bold text-brand-accent">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-lg font-extrabold text-brand-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
