'use client';

import Head from 'next/head';

import { BRAND } from '@/lib/constants';

interface Props {
  siteName?: string;
  siteUrl?: string;
  searchPath?: string; // ex: '/search?q={search_term_string}'
}

export default function WebSiteJsonLd({
  siteName = BRAND.NAME,
  siteUrl = BRAND.URL,
  searchPath = '/search?q={search_term_string}',
}: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: new URL(searchPath, siteUrl).toString(),
      'query-input': 'required name=search_term_string',
    },
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
