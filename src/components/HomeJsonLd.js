// ✅ src/components/JsonLd/HomeJsonLd.js
import React from 'react';
import Head from 'next/head';

const HomeJsonLd = ({ locale, siteUrl }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: locale === 'fr' ? 'TechPlay - Boutique high-tech' : 'TechPlay - Tech Shop',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/${locale}/search?q={search_term_string}`,
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
};

export default HomeJsonLd;
