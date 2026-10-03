/**
 * Customer reviews shown on the page.
 *
 * Add ONLY real reviews from real buyers, with their permission, exactly as
 * written (you may trim length, not change meaning). Submissions from the
 * on-site form arrive at REVIEW_WEBHOOK_URL; copy the approved ones here.
 * Never write reviews yourself or pay for positive ones (FTC rule, 2024).
 */
export type Review = {
  name: string; // first name + last initial, as the buyer agreed
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  text: string;
  color?: string; // colorway they bought
  date: string; // YYYY-MM-DD
  verified: boolean; // true only if you matched it to a paid order
};

export const reviews: Review[] = [];

/**
 * Product rating from the supplier's AliExpress listing, shown with its source.
 * Update it from the live listing, or set to null to hide it.
 */
export const listingRating: { rating: number; count: number; source: string; checked: string } | null = {
  rating: 4.9,
  count: 30,
  source: 'AliExpress product listing',
  checked: 'October 2026',
};
