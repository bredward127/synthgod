import { ShieldCheck } from 'lucide-react';

/** Bordered guarantee or honesty promise. Only promise what the business will actually honor. */
export default function PromiseBox({ eyebrow, title, body }: { eyebrow?: string; title: string; body: string }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border-2 border-brand-ink bg-brand-line/30 p-6 text-center sm:p-10">
        <ShieldCheck aria-hidden="true" className="mx-auto h-9 w-9 text-brand-accent2" />
        {eyebrow ? <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-muted">{eyebrow}</p> : null}
        <h2 className="mt-2 font-display text-2xl font-bold text-brand-ink sm:text-3xl">{title}</h2>
        <p className="mt-4 leading-relaxed text-brand-ink">{body}</p>
      </div>
    </section>
  );
}
