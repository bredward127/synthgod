import { NextResponse } from 'next/server';
import { captureOrder, notifyOrder, paypalConfigured, PayPalError } from '@/lib/store/paypal';

export const dynamic = 'force-dynamic';

const ORDER_ID_RE = /^[A-Z0-9]{8,40}$/;

/** Capture an order the buyer approved in the PayPal popup. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!paypalConfigured()) return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 });
  if (!ORDER_ID_RE.test(params.id)) return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  try {
    const { order, raw } = await captureOrder(params.id);
    await notifyOrder(order, raw);
    return NextResponse.json({
      orderId: order.orderId,
      status: order.status,
      color: order.cart.color,
      quantity: order.cart.quantity,
      total: order.total,
      currency: order.currency,
      firstName: order.firstName,
    });
  } catch (e) {
    if (e instanceof PayPalError && e.issue === 'INSTRUMENT_DECLINED') {
      return NextResponse.json({ error: 'Your payment method was declined. Please choose another.', restart: true }, { status: 402 });
    }
    if (e instanceof PayPalError && e.issue === 'ORDER_ALREADY_CAPTURED') {
      return NextResponse.json({ error: 'This order was already paid.' }, { status: 409 });
    }
    const message = e instanceof PayPalError ? e.message : 'Payment could not be completed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
