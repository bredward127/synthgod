/**
 * Store settings: the single source of truth for price, colors, shipping and
 * policy terms. The server computes every PayPal order from this file, so the
 * price shown on the page and the price charged can never drift apart.
 *
 * Edit these before going live: price, supportEmail, legalName, shipping and
 * returns must be terms you will actually honor.
 */

export type ColorId = 'orange' | 'green' | 'blue' | 'gray' | 'dark' | 'purple';

export type ColorOption = {
  id: ColorId;
  name: string;
  /** Short finish description. */
  body: string;
  /** Transparent cutout in /public/images. Omit when you have no photo. */
  image?: string;
  /** Swatch [body, keys] and glow color used behind the product. */
  swatch: [string, string];
  glow: string;
  /** Set false to show the color as sold out (checkout refuses it). */
  available: boolean;
};

export const store = {
  name: 'SynthGod',
  /** Legal seller name shown in policies and on the PayPal payment sheet. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || 'SynthGod',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@example.com',
  currency: 'USD' as const,
  product: {
    sku: 'FM1',
    name: 'M-VAVE FM-1 FM Synthesizer',
    shortName: 'FM-1',
    /** Unit price in dollars. Keep two decimals. */
    price: 79.0,
    maxQuantity: 5,
  },
  shipping: {
    /** Flat shipping per order in dollars. 0 = free shipping. */
    price: 0,
    countries: 'the United States',
    processing: '1–3 business days',
    delivery: '7–15 business days',
  },
  returns: {
    days: 30,
  },
};

export const colors: ColorOption[] = [
  { id: 'orange', name: 'Orange', body: 'Signal-orange body, brick-red keys', image: '/images/fm1-orange.webp', swatch: ['#F25A1D', '#B9432E'], glow: '255 94 31', available: true },
  { id: 'green', name: 'Green', body: 'Graphite body, mint keys', image: '/images/fm1-green.webp', swatch: ['#2B2B2E', '#7BD6C3'], glow: '111 227 207', available: true },
  { id: 'blue', name: 'Blue', body: 'Cream body, slate-blue keys', image: '/images/fm1-blue.webp', swatch: ['#F1EEE6', '#4E6E95'], glow: '96 140 210', available: true },
  { id: 'gray', name: 'Gray', body: 'Cream body, charcoal keys', image: '/images/fm1-gray.webp', swatch: ['#E9E3DA', '#45484C'], glow: '210 200 186', available: true },
  { id: 'dark', name: 'Dark', body: 'Charcoal body, black keys', image: '/images/fm1-dark.webp', swatch: ['#3A3A3D', '#141416'], glow: '150 150 160', available: true },
  { id: 'purple', name: 'Purple', body: 'Purple finish', swatch: ['#8B6CD9', '#5B3FB4'], glow: '139 108 217', available: true },
];

export const defaultColor: ColorId = 'orange';

export function colorById(id: string | undefined | null): ColorOption | undefined {
  return colors.find((c) => c.id === id);
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: store.currency }).format(value);
}
