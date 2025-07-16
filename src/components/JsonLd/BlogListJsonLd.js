import Head from 'next/head';

export default function BlogListJsonLd({ blogUrl, blogTitle }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": blogTitle || "Blog TechPlay",
    "url": blogUrl || "https://www.techplay.fr/blog"
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
