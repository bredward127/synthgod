/** Text page body for policies. */
export default function Prose({ eyebrow, title, updated, children }: { eyebrow?: string; title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-5 pb-24 pt-16 sm:pt-24">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tightest text-brand-ink">{title}</h1>
      {updated ? <p className="mt-3 text-sm text-brand-faint">Last updated {updated}</p> : null}
      <div className="mt-10 space-y-4 text-[15.5px] leading-relaxed text-brand-muted [&_a]:text-brand-ink [&_a]:underline [&_a]:underline-offset-4 [&_h2]:!mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-brand-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-brand-ink [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}
