'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { sanity } from '@/lib/sanity'
import BlogListJsonLd from '@/components/BlogListJsonLd'

export default function BlogPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    sanity
      .fetch(`*[_type == "post"] | order(_createdAt desc){
        _id,
        _createdAt,
        title,
        slug,
        excerpt,
        mainImage {
          asset-> {
            url
          }
        }
      }`)
      .then(setPosts)
      .catch((err) => console.error('Erreur Sanity:', err))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <BlogListJsonLd posts={posts} />
      <h1 className="text-2xl font-bold mb-6">📰 Blog TechPlay</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post._id} className="border p-4 rounded">
            {post.mainImage?.asset?.url && (
              <Image
                src={post.mainImage.asset.url}
                alt={post.title}
                width={600}
                height={300}
                className="rounded mb-3"
              />
            )}
            <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
            <p className="text-gray-600 mb-2">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug.current}`}
              className="text-blue-600 text-sm underline"
            >
              Lire l’article →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
