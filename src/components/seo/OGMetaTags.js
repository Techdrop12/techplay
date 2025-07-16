import Head from 'next/head';
import { metaFallback } from './metaFallback';

export default function OGMetaTags({ title, description, image, url }) {
  const meta = {
    title: title || metaFallback.title,
    description: description || metaFallback.description,
    image: image || metaFallback.image,
    url: url || 'https://www.techplay.fr',
  };

  return (
    <Head>
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
    </Head>
  );
}
