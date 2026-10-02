import Link from 'next/link';

/** Disclosures first (affiliate, not-medical-advice, pricing), then links. */
export default function SiteFooter({
  brand,
  disclosures,
  links = [],
}: {
  brand: string;
  disclosures: Array<{ title: string; body: string }>;
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <footer className="border-t border-brand-line bg-brand-line/30">
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-10 text-sm leading-relaxed text-brand-muted sm:px-6">
        <p className="font-display text-lg font-bold text-brand-ink">{brand}</p>
        {disclosures.map((d) => (
          <p key={d.title}>
            <strong className="text-brand-ink">{d.title}:</strong> {d.body}
          </p>
        ))}
        {links.length ? (
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="font-semibold text-brand-accent underline-offset-2 hover:underline">
                {l.label}
              </Link>
            ))}
          </p>
        ) : null}
        <p>
          © {new Date().getFullYear()} {brand}
        </p>
      </div>
    </footer>
  );
}
