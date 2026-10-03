'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatMoney, store } from '@/data/store';

/** Bottom bar that slides in once the hero is out of view and hides near the footer. */
export default function StickyBuyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 700;
      setShow(window.scrollY > 760 && !nearEnd);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl transition-all duration-500 ease-lux sm:bottom-5 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'
      }`}
    >
      <div className="glass flex items-center gap-3 rounded-full bg-brand-bg/70 py-2 pl-2 pr-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/fm1-orange.webp" alt="" className="h-10 w-16 object-contain" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-brand-ink">M-VAVE FM-1</p>
          <p className="truncate text-xs text-brand-muted">
            {formatMoney(store.product.price)} · {store.shipping.price === 0 ? 'Free shipping' : 'Ships fast'}
          </p>
        </div>
        <Link href="/checkout" tabIndex={show ? 0 : -1} className="btn-primary !px-6 !py-3 !text-sm">
          Buy now
        </Link>
      </div>
    </div>
  );
}
