import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/privacy', '/disclosure'].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'monthly' }));
}
