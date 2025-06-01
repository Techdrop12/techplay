// src/components/BlogCard.js
'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function BlogCard({ post }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {post.image && (
        <Image
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
          className="rounded mb-3 object-cover"
        />
      )}
      <h2 className="text-xl font-semibold">{post.title}</h2>
      <p className="text-gray-600 text-sm mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
      <Link href={`/blog/${post.slug}`} className="text-blue-600 text-sm underline mt-2 inline-block">
        Lire l’article →
      </Link>
    </div>
  )
}
