export default function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl font-bold text-brand-ink sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mx-auto mt-2 max-w-2xl text-brand-muted">{subtitle}</p> : null}
    </div>
  );
}
