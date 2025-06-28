import Head from 'next/head';

export default function BlogListJsonLd({ posts = [], locale = 'fr', siteUrl }) {
  if (!siteUrl || !Array.isArray(posts) || posts.length === 0) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
    })),
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
