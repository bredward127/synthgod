import type { Metadata } from 'next';
import CheckoutClient from '@/components/store/CheckoutClient';
import { colorById, defaultColor } from '@/data/store';

export const metadata: Metadata = { title: 'Checkout', alternates: { canonical: '/checkout' }, robots: { index: false } };

export default function CheckoutPage({ searchParams }: { searchParams: { color?: string } }) {
  const initial = colorById(searchParams.color)?.available ? colorById(searchParams.color)!.id : defaultColor;
  return (
    <CheckoutClient
      initialColor={initial}
      paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || ''}
    />
  );
}
