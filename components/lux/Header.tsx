'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { formatMoney, store } from '@/data/store';

const NAV = [
  { label: 'Features', href: '/#features' },
  { label: 'Sound', href: '/#sound' },
  { label: 'Colors', href: '/#colors' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-4 pr-2 transition-all duration-500 ease-lux ${
          scrolled ? 'glass bg-brand-bg/85 shadow-[0_20px_50px_-30px_rgb(0_0_0/0.9)]' : 'border border-transparent'
        }`}
      >
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-[13px] font-medium text-brand-muted transition hover:bg-white/5 hover:text-brand-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/checkout" className="btn-primary !px-5 !py-2.5 !text-[13px]">
            Buy · {formatMoney(store.product.price)}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-brand-ink hover:bg-white/5 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="glass fixed inset-x-3 top-[4.75rem] z-50 animate-scale-in rounded-3xl bg-brand-bg/90 p-3 md:hidden">
          <nav aria-label="Mobile">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3.5 text-lg font-medium text-brand-ink hover:bg-white/5">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
