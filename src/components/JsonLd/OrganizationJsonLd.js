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
      'https://www.facebook.com/TechPlay',
      'https://www.instagram.com/TechPlay',
      'https://www.linkedin.com/company/TechPlay'
    ]
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
