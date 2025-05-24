export default function BlogJsonLd({ post }) {
  if (!post) return null

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.image || ""],
    "author": {
      "@type": "Person",
      "name": "TechPlay"
    },
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "description": post.content?.substring(0, 160) || "",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
    />
  )
}
