/**
 * Reviews shown on the page.
 *
 * - source 'store': buyers who ordered from this site. Add ONLY real reviews,
 *   with permission, as written (trimming is fine, changing meaning is not).
 *   Submissions from the on-site form arrive at REVIEW_WEBHOOK_URL.
 * - source 'aliexpress': reviews of this product model by buyers on the
 *   AliExpress listing, copied verbatim from the export (names masked as
 *   AliExpress shows them). Always displayed with their source.
 *
 * Never write reviews yourself or pay for positive ones (FTC rule, 2024).
 */
export type Review = {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  text: string;
  /** Colorway they bought. */
  color?: string;
  /** YYYY-MM-DD */
  date: string;
  /** ISO country code of the reviewer, when known. */
  country?: string;
  source: 'store' | 'aliexpress';
  /** true only for store reviews you matched to a paid order. */
  verified: boolean;
};

export const reviews: Review[] = [
  {
    name: "U***r",
    rating: 5,
    text: "Fast shipment to USA, and excellent communication with the state of delivery. Item itself arrived safe and sound and sounds great!",
    color: "Dark",
    date: '2026-10-02',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "U***r",
    rating: 5,
    text: "Got it for my bf for his birthday and he says everything works great and he loves it!!",
    color: "Green",
    date: '2026-09-28',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "Anonymous",
    rating: 5,
    text: "amazing unit, fits perfectly in my ipados korg gadget studio with mpc mini!",
    color: "Orange",
    date: '2026-09-25',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "a***r",
    rating: 5,
    text: "Works perfectly! Nice color, fast shipping!",
    color: "Orange",
    date: '2026-09-13',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "Anonymous",
    rating: 5,
    text: "it came 2 days earlier than expected the packaging was fine. nothing special but it doesn't really need it and the product is as listed. I had already watched a couple of YouTube videos reviewing it and this is the genuine M-vave fm synth I am happy",
    color: "Green",
    date: '2026-09-12',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "U***r",
    rating: 5,
    text: "Been having fun with this. My friend and i ordered it at the same time and they arrived together! On time and perfect conditions :)",
    date: '2026-08-16',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "r***i",
    rating: 5,
    text: "First ever purchase on AliExpress, this was a test buy and I am very happy with item description & the time it took to arrive from China to United Kingdom..(2 weeks) The item its self is exactly what I ordered and I have to say for £40.25 delivered it is a bargain and good little FM synth for that price, smaller than a Volca but well built and has good little screen, can be loaded with .xyz file pre-sets from Yamaha dx7...only down side is sequencer can not do rests but can do tie`s, hopefully an update will cure this one gripe.",
    color: "Dark",
    date: '2026-08-16',
    country: 'GB',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "E***d",
    rating: 5,
    text: "Very good quality and functionality for the price.",
    color: "Green",
    date: '2026-08-02',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
  {
    name: "C***r",
    rating: 5,
    text: "Amazing synth for its money.",
    color: "Green",
    date: '2026-07-18',
    country: 'US',
    source: 'aliexpress',
    verified: false,
  },
];

/**
 * Overall product rating from the AliExpress listing, shown with its source.
 * Update it from the live listing, or set to null to hide it.
 */
export const listingRating: { rating: number; count: number; source: string; checked: string } | null = {
  rating: 4.9,
  count: 30,
  source: 'AliExpress product listing',
  checked: 'October 2026',
};
