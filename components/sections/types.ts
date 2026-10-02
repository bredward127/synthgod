import type { LucideIcon } from 'lucide-react';

/** A call to action. External hrefs open in a new tab and are tracked as outbound. */
export type Cta = { label: string; href: string; id: string; sponsored?: boolean };

export type IconItem = { icon?: LucideIcon; title: string; body: string };

export type ProductItem = {
  id: string;
  name: string;
  badge?: string;
  /** e.g. "Best overall", "Budget pick". Shown as a pill on the image. */
  label?: string;
  description: string;
  highlights?: string[];
  imageUrl?: string;
  icon?: LucideIcon;
  /** Only real figures copied from the live listing. Omit otherwise. */
  rating?: number;
  reviewCount?: number;
  cta: Cta;
  /** Small print under the button, e.g. "Affiliate link · opens Amazon". */
  ctaNote?: string;
  featured?: boolean;
};
