import Head from 'next/head';

export default function HomeJsonLd({ locale = 'fr', siteUrl }) {
  if (!siteUrl) return null;

  const url = `${siteUrl}/${locale}`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url,
    name:
      locale === 'fr'
        ? 'TechPlay – Boutique high-tech, gadgets et innovations'
        : 'TechPlay – Tech gadgets & smart shop',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
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
