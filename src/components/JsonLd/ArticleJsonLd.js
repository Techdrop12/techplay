import Head from 'next/head';

export default function ArticleJsonLd({ title, description, date, author, slug }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": date,
    "author": {
      "@type": "Person",
      "name": author
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.techplay.fr/blog/${slug}`
    }
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
