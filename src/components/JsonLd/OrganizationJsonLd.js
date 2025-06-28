// ✅ /src/components/JsonLd/OrganizationJsonLd.js (SEO marque/organisation)
import Head from 'next/head';

export default function OrganizationJsonLd() {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'TechPlay',
            url: 'https://techplay.fr',
            logo: 'https://techplay.fr/logo.png',
            sameAs: [
              'https://www.facebook.com/techplay',
              'https://www.instagram.com/techplay',
              'https://twitter.com/techplay',
            ],
          }),
        }}
      />
    </Head>
  );
}
