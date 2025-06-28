import Head from 'next/head';

export default function BlogJsonLd({ locale = 'fr', siteUrl }) {
  if (!siteUrl) return null;

  const url = `${siteUrl}/${locale}/blog`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url,
    name: locale === 'fr' ? 'Blog TechPlay' : 'TechPlay Blog',
    description:
      locale === 'fr'
        ? 'Actualités, conseils et tendances high-tech sélectionnés par l’équipe TechPlay. Astuces, nouveautés, innovations et guides pratiques.'
        : 'Tech news, advice, and trending topics curated by the TechPlay team. Tips, innovations and practical guides.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechPlay',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512
      }
    }
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
