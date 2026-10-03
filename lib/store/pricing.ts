/**
 * Cart validation and order math. Pure functions, shared by the checkout UI
 * and the PayPal API routes. The server never trusts a client-sent price:
 * it re-validates the cart and recomputes the totals here.
 */
import { colorById, store, type ColorId } from '../../data/store.ts';

export type Cart = { color: ColorId; quantity: number };

export type Quote = {
  unit: string;
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
};

/** Money as a fixed 2-decimal string, computed in cents to avoid float drift. */
export function money(cents: number): string {
  return (Math.round(cents) / 100).toFixed(2);
}

export function validateCart(input: unknown): { ok: true; cart: Cart } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid cart.' };
  const { color, quantity } = input as Record<string, unknown>;
  const option = typeof color === 'string' ? colorById(color) : undefined;
  if (!option) return { ok: false, error: 'Unknown color.' };
  if (!option.available) return { ok: false, error: `${option.name} is sold out.` };
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > store.product.maxQuantity) {
    return { ok: false, error: `Quantity must be between 1 and ${store.product.maxQuantity}.` };
  }
  return { ok: true, cart: { color: option.id, quantity } };
}

export function quote(cart: Cart): Quote {
  const unitCents = Math.round(store.product.price * 100);
  const subtotalCents = unitCents * cart.quantity;
  const shippingCents = Math.round(store.shipping.price * 100);
  return {
    unit: money(unitCents),
    subtotal: money(subtotalCents),
    shipping: money(shippingCents),
    total: money(subtotalCents + shippingCents),
    currency: store.currency,
  };
}

/** Compact, non-identifying cart tag stored on the PayPal order (custom_id). */
export function cartTag(cart: Cart): string {
  return `${store.product.sku}:${cart.color}:${cart.quantity}`;
}

export function parseCartTag(tag: string | undefined): Cart | null {
  const [sku, color, qty] = (tag ?? '').split(':');
  if (sku !== store.product.sku) return null;
  const result = validateCart({ color, quantity: Number(qty) });
  return result.ok ? result.cart : null;
}
