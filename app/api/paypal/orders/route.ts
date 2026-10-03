import { NextResponse } from 'next/server';
import { validateCart } from '@/lib/store/pricing';
import { createOrder, paypalConfigured, PayPalError } from '@/lib/store/paypal';

export const dynamic = 'force-dynamic';

/** Create a PayPal order. Body: { color, quantity }. Price comes from data/store.ts. */
export async function POST(req: Request) {
  if (!paypalConfigured()) return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 });
  const body = await req.json().catch(() => null);
  const result = validateCart(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  try {
    const { id } = await createOrder(result.cart);
    return NextResponse.json({ id });
  } catch (e) {
    const status = e instanceof PayPalError ? e.status : 500;
    return NextResponse.json({ error: 'Could not start the PayPal checkout. Please try again.' }, { status: status >= 500 ? 502 : status });
  }
}
