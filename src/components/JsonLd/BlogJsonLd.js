import Head from 'next/head';

export default function BlogJsonLd({ posts }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "url": "https://www.techplay.fr/blog",
    "name": "TechPlay Blog",
    "description": "Articles et actualités tech & e-commerce",
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `https://www.techplay.fr/blog/${post.slug}`,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author || 'TechPlay'
      }
    }))
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
