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

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
        'shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]'
      )}
      aria-label={`Lire l'article : ${article.title}`}
    >
      <Link href={`/blog/${article.slug}`} className="flex flex-1 flex-col">
        {/* Editorial feature image — no overlay, clean frame */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[hsl(var(--surface-2))]">
          <Image
            src={imageSrc}
            alt={article.title ? String(article.title) : ''}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:scale-[1.02]"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority
          />
          {category ? (
            <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text))] shadow-sm dark:bg-black/60 dark:text-white">
              {category}
            </span>
          ) : null}
        </div>

        {/* Editorial content block — hierarchy: meta → headline → excerpt → read */}
        <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7">
          {dateLabel ? (
            <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-token-text/55">
              {dateLabel}
            </p>
          ) : null}

          <h2 className="mt-2.5 line-clamp-2 text-[1.125rem] font-bold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-[1.25rem] sm:leading-snug">
            {article.title}
          </h2>

          {article.description ? (
            <p className="mt-4 line-clamp-3 text-[14px] leading-[1.6] text-token-text/75">
              {article.description}
            </p>
          ) : null}

          <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[hsl(var(--accent))] decoration-[hsl(var(--accent))] underline-offset-2 group-hover:underline">
            Lire l'article
            <span aria-hidden className="text-[10px] opacity-80">→</span>
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
