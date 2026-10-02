/** Simple text page body (privacy, disclosure). */
export default function Prose({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-brand-ink">{title}</h1>
      {updated ? <p className="mt-2 text-sm text-brand-muted">Last updated {updated}</p> : null}
      <div className="mt-8 space-y-4 leading-relaxed text-brand-muted [&_a]:font-semibold [&_a]:text-brand-accent [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-brand-ink">
        {children}
      </div>
    </article>
  );
}
