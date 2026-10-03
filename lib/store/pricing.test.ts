import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartTag, money, parseCartTag, quote, validateCart } from './pricing.ts';
import { store } from '../../data/store.ts';

test('money formats cents without float drift', () => {
  assert.equal(money(7900), '79.00');
  assert.equal(money(1), '0.01');
  assert.equal(money(0.1 * 100 + 0.2 * 100), '0.30');
});

test('validateCart accepts a known color and sane quantity', () => {
  assert.deepEqual(validateCart({ color: 'orange', quantity: 2 }), { ok: true, cart: { color: 'orange', quantity: 2 } });
});

test('validateCart rejects bad input', () => {
  for (const input of [null, 'x', {}, { color: 'pink', quantity: 1 }, { color: 'orange', quantity: 0 }, { color: 'orange', quantity: 1.5 }, { color: 'orange', quantity: store.product.maxQuantity + 1 }, { color: 'orange', quantity: '2' }]) {
    assert.equal(validateCart(input).ok, false, JSON.stringify(input));
  }
});

test('quote totals come from store config, not the client', () => {
  const q = quote({ color: 'blue', quantity: 3 });
  const unit = Math.round(store.product.price * 100);
  const ship = Math.round(store.shipping.price * 100);
  assert.equal(q.unit, money(unit));
  assert.equal(q.subtotal, money(unit * 3));
  assert.equal(q.total, money(unit * 3 + ship));
  assert.equal(q.currency, 'USD');
});

test('cart tags round-trip and reject tampering', () => {
  const cart = { color: 'green' as const, quantity: 2 };
  assert.deepEqual(parseCartTag(cartTag(cart)), cart);
  assert.equal(parseCartTag('FM1:green:99'), null);
  assert.equal(parseCartTag('OTHER:green:1'), null);
  assert.equal(parseCartTag(undefined), null);
});
