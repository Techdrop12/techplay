// ✅ /src/components/seo/OGMetaTags.js (bonus SEO, open graph)
import Head from 'next/head';

export default function OGMetaTags({ title, description, image = '/og-image.jpg', url }) {
  return (
    <Head>
      <meta property="og:title" content={title || 'TechPlay'} />
      <meta property="og:description" content={description || 'TechPlay, boutique tech'} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url || 'https://techplay.fr'} />
    </Head>
  );
}
