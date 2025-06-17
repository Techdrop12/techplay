// ✅ src/components/JsonLd/ArticleJsonLd.js
'use client'

import Script from 'next/script'

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
    "datePublished": new Date(post.createdAt).toISOString(),
    "dateModified": new Date(post.updatedAt).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
    }
  }

  return (
    <Script
      id={`article-jsonld-${post.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
