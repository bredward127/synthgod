import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/play', '/checkout', '/shipping', '/returns', '/terms', '/privacy', '/contact'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.5,
  }));
}
