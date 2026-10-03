import 'server-only';
import { colorById, store } from '@/data/store';
import { cartTag, parseCartTag, quote, type Cart } from '@/lib/store/pricing';

/**
 * Minimal PayPal Orders v2 client (server only). Credentials come from
 * PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET; PAYPAL_ENV=live switches from the
 * sandbox to real payments. PAYPAL_API_BASE overrides the host (tests only).
 */
const BASE =
  process.env.PAYPAL_API_BASE?.trim() || (process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');

export class PayPalError extends Error {
  constructor(
    message: string,
    public status: number,
    public issue?: string,
  ) {
    super(message);
  }
}

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

let cached: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const id = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!id || !secret) throw new PayPalError('PayPal is not configured.', 503);
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new PayPalError('Could not authenticate with PayPal.', 502);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function call<T>(path: string, body?: unknown, requestId?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as T & { details?: Array<{ issue?: string }>; message?: string };
  if (!res.ok) throw new PayPalError(data.message || 'PayPal request failed.', res.status, data.details?.[0]?.issue);
  return data;
}

export async function createOrder(cart: Cart): Promise<{ id: string }> {
  const q = quote(cart);
  const color = colorById(cart.color)!;
  const order = await call<{ id: string }>(
    '/v2/checkout/orders',
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: store.product.sku,
          custom_id: cartTag(cart),
          description: `${store.product.name} (${color.name})`,
          soft_descriptor: store.name.slice(0, 22),
          amount: {
            currency_code: q.currency,
            value: q.total,
            breakdown: {
              item_total: { currency_code: q.currency, value: q.subtotal },
              shipping: { currency_code: q.currency, value: q.shipping },
            },
          },
          items: [
            {
              name: `${store.product.name} - ${color.name}`.slice(0, 127),
              sku: `${store.product.sku}-${color.id.toUpperCase()}`,
              quantity: String(cart.quantity),
              unit_amount: { currency_code: q.currency, value: q.unit },
              category: 'PHYSICAL_GOODS',
            },
          ],
        },
      ],
      application_context: {
        brand_name: store.legalName.slice(0, 127),
        shipping_preference: 'GET_FROM_FILE',
        user_action: 'PAY_NOW',
      },
    },
    crypto.randomUUID(),
  );
  return { id: order.id };
}

type Capture = {
  id: string;
  status: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  purchase_units?: Array<{
    custom_id?: string;
    shipping?: { name?: { full_name?: string }; address?: Record<string, string> };
    payments?: { captures?: Array<{ id: string; status: string; custom_id?: string; amount: { value: string; currency_code: string } }> };
  }>;
};

export type CapturedOrder = {
  orderId: string;
  captureId: string;
  status: string;
  cart: Cart;
  total: string;
  currency: string;
  firstName?: string;
};

/** Capture an approved order and check the money matches what we quoted. */
export async function captureOrder(orderId: string): Promise<{ order: CapturedOrder; raw: Capture }> {
  const raw = await call<Capture>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, undefined, `capture-${orderId}`);
  const unit = raw.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const cart = parseCartTag(capture?.custom_id ?? unit?.custom_id);
  if (!capture || !cart) throw new PayPalError('Payment captured but the order details were unreadable. Contact support.', 500);
  const expected = quote(cart);
  if (capture.amount.value !== expected.total || capture.amount.currency_code !== expected.currency) {
    throw new PayPalError('Captured amount does not match the order. Contact support.', 500);
  }
  return {
    raw,
    order: {
      orderId: raw.id,
      captureId: capture.id,
      status: capture.status,
      cart,
      total: capture.amount.value,
      currency: capture.amount.currency_code,
      firstName: raw.payer?.name?.given_name,
    },
  };
}

/**
 * Send the paid order (with shipping address) to your own webhook, e.g. a
 * Zapier/Make zap that emails you or files it in a sheet. Optional: every
 * order is also in your PayPal dashboard. Never throws.
 */
export async function notifyOrder(order: CapturedOrder, raw: Capture): Promise<void> {
  const url = process.env.ORDER_WEBHOOK_URL?.trim();
  if (!url) return;
  const unit = raw.purchase_units?.[0];
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order.paid',
        orderId: order.orderId,
        captureId: order.captureId,
        product: store.product.name,
        color: colorById(order.cart.color)?.name,
        quantity: order.cart.quantity,
        total: order.total,
        currency: order.currency,
        email: raw.payer?.email_address,
        shipTo: { name: unit?.shipping?.name?.full_name, address: unit?.shipping?.address },
        paidAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // The payment already succeeded; the order is still in PayPal.
  }
}
