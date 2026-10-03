import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import Prose from '@/components/lux/Prose';
import { store } from '@/data/store';

export const metadata: Metadata = { title: 'Contact', alternates: { canonical: '/contact' } };

export default function ContactPage() {
  return (
    <Prose eyebrow="Help" title="Contact us">
      <p>Questions about the FM-1, an order, shipping or a return? Email us and include your order ID if you have one. We reply within one business day.</p>
      <p className="!mt-8">
        <a href={`mailto:${store.supportEmail}`} className="btn-primary !text-brand-accent-ink !no-underline">
          <Mail className="h-4 w-4" />
          {store.supportEmail}
        </a>
      </p>
    </Prose>
  );
}
