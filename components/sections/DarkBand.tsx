/** Contrast band: one bold line plus two sentences. `highlight` is a phrase inside `body`. */
export default function DarkBand({ title, body, highlight }: { title: string; body: string; highlight?: string }) {
  const parts = highlight && body.includes(highlight) ? body.split(highlight) : [body];
  return (
    <section className="bg-brand-band px-4 py-16 text-center sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-3xl font-bold leading-tight text-brand-band-ink sm:text-4xl">{title}</h2>
        <p className="mt-5 text-lg leading-relaxed text-brand-band-ink/75">
          {parts.length === 2 ? (
            <>
              {parts[0]}
              <span className="font-bold text-brand-accent2">{highlight}</span>
              {parts[1]}
            </>
          ) : (
            body
          )}
        </p>
      </div>
    </section>
  );
}
