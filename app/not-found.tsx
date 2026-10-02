import Link from 'next/link';
import { site } from '@/data/site';
import SiteHeader from '@/components/sections/SiteHeader';
import PagesLayout from '@/app/(pages)/layout';

export default function NotFound() {
  return (
    <PagesLayout>
      <SiteHeader brand={site.brand} badge={site.badge} />
      <section className="px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold text-brand-ink">Page not found</h1>
        <Link href="/" className="mt-6 inline-block font-semibold text-brand-accent">
          Back to the FM-1
        </Link>
      </section>
    </PagesLayout>
  );
}
