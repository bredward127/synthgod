import Link from 'next/link';

/** One-line strip above the header. Use it for the affiliate disclosure or a true offer. */
export default function AnnouncementBar({ text, link }: { text: string; link?: { label: string; href: string } }) {
  return (
    <p className="bg-brand-band px-4 py-2 text-center text-xs font-semibold tracking-wide text-brand-band-ink/90">
      {text}{' '}
      {link ? (
        <Link href={link.href} className="underline underline-offset-2 hover:text-brand-band-ink">
          {link.label}
        </Link>
      ) : null}
    </p>
  );
}
