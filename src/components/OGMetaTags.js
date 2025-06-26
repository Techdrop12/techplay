// ✅ src/components/OGMetaTags.js

import Head from 'next/head';

export default function OGMetaTags({ title, description, image, url }) {
  return (
    <Head>
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || 'TechPlay'} />
      <meta property="og:description" content={description || 'Tech, gadgets & accessoires'} />
      <meta property="og:image" content={image || '/logo.png'} />
      <meta property="og:url" content={url || process.env.NEXT_PUBLIC_SITE_URL} />
      <meta property="og:site_name" content="TechPlay" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || 'TechPlay'} />
      <meta name="twitter:description" content={description || 'Tech, gadgets & accessoires'} />
      <meta name="twitter:image" content={image || '/logo.png'} />
    </Head>
  );
}
