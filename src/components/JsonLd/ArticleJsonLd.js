// src/components/JsonLd/ArticleJsonLd.js
'use client'

export default function ArticleJsonLd({ post }) {
  if (!post) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": post.image || `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    "author": {
      "@type": "Person",
      "name": "TechPlay"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TechPlay",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      }
    },
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
    }
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )
}
