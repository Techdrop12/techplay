import Head from 'next/head';

export default function ArticleJsonLd({ article, siteUrl }) {
  if (!article || !siteUrl) return null;

  const {
    title,
    description,
    image,
    author = 'TechPlay AI',
    publishedAt,
    updatedAt,
    slug,
  } = article;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechPlay',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
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
