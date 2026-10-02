import Button from './Button';
import type { Cta } from './types';

export default function FinalCta({ title, body, cta }: { title: string; body?: string; cta: Cta }) {
  return (
    <section className="px-4 pb-20 pt-8 text-center sm:px-6">
      <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold text-brand-ink sm:text-4xl">{title}</h2>
      {body ? <p className="mx-auto mt-3 max-w-lg text-lg text-brand-muted">{body}</p> : null}
      <div className="mt-8">
        <Button cta={cta} slot="final" />
      </div>
    </section>
  );
}
