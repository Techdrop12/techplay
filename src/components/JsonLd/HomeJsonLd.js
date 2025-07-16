import Head from 'next/head';

export default function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TechPlay",
    "url": "https://www.techplay.fr",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.techplay.fr/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
