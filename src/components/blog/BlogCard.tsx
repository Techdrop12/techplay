// src/components/blog/BlogCard.tsx
'use client'


import Image from 'next/image'
import { motion } from 'framer-motion'
import type { BlogPost } from '@/types/blog'

interface BlogCardProps {
  article: BlogPost
}

export default function BlogCard({ article }: BlogCardProps) {
  return (
    <motion.article
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-zinc-900"
      aria-label={`Lire l'article : ${article.title}`}
    >
      {article.image && (
        <div className="relative w-full h-48 rounded overflow-hidden mb-3">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <h2 className="text-xl font-bold text-brand line-clamp-2">{article.title}</h2>

      {article.createdAt && (
        <p className="text-gray-500 text-sm mt-1">
          {new Date(article.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      )}

      {article.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
          {article.description}
        </p>
      )}

      <Link
        href={`/blog/${article.slug}`}
        className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium"
      >
        Lire l’article →
      </Link>
    </motion.article>
  )
}
