// ✅ src/components/JsonLd/BlogJsonLd.js
import React from 'react';
import Head from 'next/head';

const BlogJsonLd = ({ locale, siteUrl }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url: `${siteUrl}/${locale}/blog`,
    name: locale === 'fr' ? 'Blog TechPlay' : 'TechPlay Blog',
    description: locale === 'fr'
      ? 'Actualités, conseils et tendances high-tech sélectionnés par TechPlay.'
      : 'Tech news, tips and trends curated by TechPlay.',
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

export default BlogJsonLd;
