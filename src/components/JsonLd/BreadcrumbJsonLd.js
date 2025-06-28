import React from 'react';
import Head from 'next/head';

const BreadcrumbJsonLd = ({ pathSegments = [], segments }) => {
  // Compatibilité : accepte `segments` ou `pathSegments`
  const list = Array.isArray(segments) && segments.length > 0 ? segments : pathSegments;

  const itemListElement = list.map((segment, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: segment.label,
    item: segment.url,
  }));

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement,
          }),
        }}
      />
    </Head>
  );
};

export default BreadcrumbJsonLd;
