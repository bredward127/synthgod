import Header from '@/components/lux/Header';
import Footer from '@/components/lux/Footer';
import RevealObserver from '@/components/lux/RevealObserver';
import { store } from '@/data/store';

/** Store chrome: announcement strip, floating header, footer, scroll reveals. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <p className="border-b border-white/[0.06] px-4 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand-muted">
        {store.shipping.price === 0 ? `Free shipping to ${store.shipping.countries === 'the United States' ? 'the US' : store.shipping.countries}` : 'Fast shipping'}
        <span className="mx-3 text-brand-accent">◆</span>
        {store.returns.days}-day returns
        <span className="mx-3 hidden text-brand-accent sm:inline">◆</span>
        <span className="hidden sm:inline">Secure checkout with PayPal</span>
      </p>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <RevealObserver />
    </div>
  );
}
