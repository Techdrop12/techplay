// src/components/blog/BlogCard.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

import type { BlogPost } from '@/types/blog'

import Link from '@/components/LocalizedLink'
import { safeProductImageUrl } from '@/lib/safeProductImage'
import { cn, formatDate } from '@/lib/utils'

interface BlogCardProps {
  article: BlogPost
}

function getSafeImage(article: BlogPost): string {
  if (article.image && typeof article.image === 'string') {
    return safeProductImageUrl(article.image)
  }

  return '/og-image.jpg'
}

export default function BlogCard({ article }: BlogCardProps) {
  const imageSrc = getSafeImage(article)
  const dateLabel = formatDate(article.createdAt)
  const category = Array.isArray(article.tags) && article.tags.length > 0 ? article.tags[0] : undefined

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))]/80',
        'bg-[hsl(var(--surface))]/95 shadow-md shadow-black/5 ring-1 ring-black/0',
        'transition-all duration-300 ease-[var(--ease-smooth)] hover:shadow-xl hover:ring-[hsl(var(--accent)/.35)]'
      )}
      aria-label={`Lire l'article : ${article.title}`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-[hsl(var(--surface-2))] sm:h-52">
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:scale-[1.05]"
          priority
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {category ? (
          <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md shadow-black/40 backdrop-blur-sm">
            {category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
        {dateLabel ? (
          <p className="text-xs font-medium uppercase tracking-wide text-token-text/60">
            {dateLabel}
          </p>
        ) : null}

        <h2 className="mt-1 line-clamp-2 text-base font-semibold tracking-tight text-token-text sm:text-lg">
          {article.title}
        </h2>

        {article.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-token-text/75">
            {article.description}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={`/blog/${article.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-600))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
            prefetch={false}
          >
            <span>Lire l’article</span>
            <span aria-hidden>↗</span>
          </Link>

          <span className="text-[11px] font-medium uppercase tracking-wide text-token-text/50">
            {Array.isArray(article.tags) && article.tags.length > 1
              ? `${article.tags.length} tags`
              : 'Article TechPlay'}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
