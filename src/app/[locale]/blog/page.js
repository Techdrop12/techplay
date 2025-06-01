'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import BlogCard from '@/components/BlogCard'
import BlogListJsonLd from '@/components/BlogListJsonLd'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const locale = useLocale()

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then(setPosts)
      .catch(console.error)
  }, [])

  const getTranslatedPost = (post) => {
    const content = locale === 'en' && post.en ? post.en : post.content
    return {
      ...post,
      content,
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <BlogListJsonLd posts={posts} />
      <h1 className="text-2xl font-bold mb-6">
        {locale === 'en' ? '📰 TechPlay Blog' : '📰 Blog TechPlay'}
      </h1>

      <div className="grid gap-6">
        {posts.map((post) => (
          <BlogCard key={post._id} post={getTranslatedPost(post)} />
        ))}
      </div>
    </div>
  )
}