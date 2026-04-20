import { NextResponse } from 'next/server';

import { getPosts } from '@/lib/blog';
import { getAllProducts } from '@/lib/data';
import { buildStaticSitemap, entriesToXml, type SitemapEntry, withBaseLocale } from '@/lib/sitemap';

export const runtime = 'nodejs';
export const revalidate = 3600;

const LOCALES = ['fr', 'en'] as const;

export async function GET() {
  const [productsResult, postsResult] = await Promise.allSettled([
    getAllProducts(),
    getPosts({ limit: 500, publishedOnly: true }),
  ]);

  const dynamicEntries: SitemapEntry[] = [];

  if (productsResult.status === 'fulfilled') {
    for (const product of productsResult.value as Array<{ slug?: string; updatedAt?: string }>) {
      if (!product.slug) continue;
      for (const locale of LOCALES) {
        dynamicEntries.push({
          url: withBaseLocale(`/products/${product.slug}`, locale),
          lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
          changefreq: 'weekly',
          priority: 0.9,
        });
      }
    }
  }

  if (postsResult.status === 'fulfilled') {
    for (const post of (postsResult.value.items ?? []) as Array<{ slug?: string; updatedAt?: string }>) {
      if (!post.slug) continue;
      for (const locale of LOCALES) {
        dynamicEntries.push({
          url: withBaseLocale(`/blog/${post.slug}`, locale),
          lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.7,
        });
      }
    }
  }

  const entries = [...buildStaticSitemap(), ...dynamicEntries];
  const xml = entriesToXml(entries);

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
    },
  });
}
