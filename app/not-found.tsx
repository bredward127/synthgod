import Link from 'next/link';
import StoreLayout from '@/app/(pages)/layout';

export default function NotFound() {
  return (
    <StoreLayout>
      <section className="px-5 py-32 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tightest text-brand-ink">This page is off-key.</h1>
        <Link href="/" className="btn-ghost mt-10">
          Back to the FM-1
        </Link>
      </section>
    </StoreLayout>
  );
}
