// ✅ /src/components/seo/MetaTags.js (bonus meta tags SEO étendus)
import Head from 'next/head';

export default function MetaTags({
  title,
  description,
  url,
  image = '/og-image.jpg'
}) {
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title || 'TechPlay'} />
      <meta property="og:description" content={description || 'TechPlay, boutique tech et accessoires'} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url || 'https://techplay.fr'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || 'TechPlay'} />
      <meta name="twitter:description" content={description || 'TechPlay, boutique tech'} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url || 'https://techplay.fr'} />
    </Head>
  );
}
