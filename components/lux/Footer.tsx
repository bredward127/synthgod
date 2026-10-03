import Link from 'next/link';
import Logo from './Logo';
import { store } from '@/data/store';

const COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'Buy the FM-1', href: '/checkout' },
      { label: 'Colors', href: '/#colors' },
      { label: 'Reviews', href: '/#reviews' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns & refunds', href: '/returns' },
      { label: 'Terms of sale', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact us', href: '/contact' },
      { label: store.supportEmail, href: `mailto:${store.supportEmail}` },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-muted">
            Handheld FM synthesis, shipped to your door. Payments are processed securely by PayPal.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="eyebrow">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="break-all text-sm text-brand-muted transition hover:text-brand-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs leading-relaxed text-brand-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {store.legalName}. {store.name} is an independent retailer, not affiliated with or endorsed by M-VAVE.
            M-VAVE and FM-1 are names of their respective owner.
          </p>
          <p className="shrink-0">Prices in {store.currency}</p>
        </div>
      </div>
    </footer>
  );
}
