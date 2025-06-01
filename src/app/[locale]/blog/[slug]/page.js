'use client'

import { useEffect, useState } from 'react'
import { useLocale, useParams } from 'next-intl'
import Image from 'next/image'
import SEOHead from '@/components/SEOHead'
import ArticleJsonLd from '@/components/JsonLd/ArticleJsonLd'

export default function BlogPostPage() {
  const { slug } = useParams()
  const locale = useLocale()
  const [post, setPost] = useState(null)

  useEffect(() => {
    fetch(`/api/blog/one?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const translatedContent = locale === 'en' && data.en ? data.en : data.content
        setPost({ ...data, content: translatedContent })
      })
      .catch(console.error)
  }, [slug, locale])

  if (!post) return <p className="p-6 text-center text-gray-600">Chargement...</p>

  return (
    <>
      <SEOHead
        overrideTitle={post.title}
        overrideDescription={post.content?.slice(0, 150)}
        image={post.image}
      />
      <ArticleJsonLd post={post} />
      <article className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="rounded mb-4"
          />
        )}
        <div
          className="prose prose-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  )
}
