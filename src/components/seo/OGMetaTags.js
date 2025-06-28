'use client';

import Head from 'next/head';

export default function OGMetaTags({ title, description, image, url }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr';

  const finalTitle = title || 'TechPlay – High Tech & Gadgets';
  const finalDescription = description || 'TechPlay : boutique en ligne d’objets tech, gadgets, innovations.';
  const finalImage = image || `${siteUrl}/og-image.jpg`;
  const finalUrl = url || siteUrl;

  return (
    <Head>
      {/* Open Graph (Facebook & LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TechPlay" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Head>
  );
}
