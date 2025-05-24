export default function BlogListJsonLd({ posts }) {
  if (!posts || posts.length === 0) return null

  const blogPosts = posts.map(post => ({
    "@type": "BlogPosting",
    "headline": post.title,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug.current}`,
    "image": post.mainImage?.asset?.url || "",
    "description": post.excerpt || "",
    "datePublished": post._createdAt,
    "author": {
      "@type": "Person",
      "name": "TechPlay"
    }
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "TechPlay Blog",
    "blogPosts": blogPosts
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
