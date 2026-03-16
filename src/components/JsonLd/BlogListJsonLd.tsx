// src/components/JsonLd/BlogListJsonLd.tsx
'use client';

import Head from 'next/head';

import type { BlogPost } from '@/types/blog';

import { BRAND } from '@/lib/constants';

interface BlogListJsonLdProps {
  posts: BlogPost[];
  locale?: 'fr' | 'en';
  siteUrl?: string;
}

export default function BlogListJsonLd({
  posts = [],
  locale = 'fr',
  siteUrl = BRAND.URL,
}: BlogListJsonLdProps) {
  if (!Array.isArray(posts) || posts.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: new URL(`/${locale}/blog/${post.slug}`, siteUrl).toString(),
    })),
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
}
