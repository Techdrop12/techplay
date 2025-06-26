// ✅ src/components/JsonLd/HomeJsonLd.js

import Head from 'next/head';

export default function HomeJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechPlay',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.fr'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
}
