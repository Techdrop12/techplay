import Head from 'next/head';

export default function BreadcrumbJsonLd({ pathSegments = [], segments }) {
  const list = Array.isArray(segments) && segments.length > 0 ? segments : pathSegments;

  if (!list || !Array.isArray(list) || list.length === 0) return null;

  const itemListElement = list.map((segment, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: segment.label,
    item: segment.url,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
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
