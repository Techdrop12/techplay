// ✅ src/components/JsonLd/BlogListJsonLd.js
import React from 'react';
import Head from 'next/head';

const BlogListJsonLd = ({ posts, locale, siteUrl }) => {
  const items = posts.map((post, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${siteUrl}/${locale}/blog/${post.slug}`,
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
    </Head>
  );
};

export default BlogListJsonLd;
