// ✅ src/components/JsonLd/ArticleJsonLd.js
import React from 'react';
import Head from 'next/head';

const ArticleJsonLd = ({ title, description, url, image, datePublished, authorName }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    url,
    datePublished,
    author: {
      '@type': 'Person',
      name: authorName || 'TechPlay AI',
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

export default ArticleJsonLd;
