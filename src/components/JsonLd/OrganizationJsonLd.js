import Head from 'next/head';

export default function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechPlay',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://www.facebook.com/techplay',
      'https://www.instagram.com/techplay',
      'https://twitter.com/techplay',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+33-1-23-45-67-89',
        contactType: 'customer service',
        areaServed: 'FR',
        availableLanguage: ['French', 'English'],
      },
    ],
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
