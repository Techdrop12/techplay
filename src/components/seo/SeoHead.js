import Head from 'next/head';

export default function SeoHead({ title, description }) {
  const fullTitle = title ? `${title} – TechPlay` : 'TechPlay – Boutique Tech Premium';
  const desc = description || 'Boutique high-tech, gadgets et accessoires innovants. Livraison rapide, SAV premium.';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
