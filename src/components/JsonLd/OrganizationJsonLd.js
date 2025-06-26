// ✅ src/components/JsonLd/OrganizationJsonLd.js

import Head from 'next/head';

export default function OrganizationJsonLd() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechPlay',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.fr',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.fr'}/logo.png`,
    sameAs: [
      'https://facebook.com/techplay',
      'https://instagram.com/techplay',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
    </Head>
  );
}
