import type { MetadataRoute } from 'next';

import { BRAND } from '@/lib/constants';

/**
 * robots.txt dynamique : Sitemap basé sur NEXT_PUBLIC_SITE_URL, pages privées en disallow.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = BRAND.URL || 'https://techplay.example.com';
  const sitemap = `${origin}/api/sitemap`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/commande', '/account', '/admin', '/login', '/cart', '/api/', '/_next/'],
      },
    ],
    sitemap,
    host: origin,
  };
}
