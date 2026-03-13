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
        'group relative flex flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))]',
        'card shadow-[var(--shadow-md)] transition-all duration-300 ease-[var(--ease-smooth)] hover:shadow-[var(--shadow-card-hover)]'
      )}
      aria-label={`Lire l'article : ${article.title}`}
    >
      <Link href={`/blog/${article.slug}`} prefetch={false} className="block flex-1 flex flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[hsl(var(--surface-2))] sm:aspect-[2/1]">
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:scale-[1.05]"
          priority
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {category ? (
            <span className="inline-flex items-center rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {category}
            </span>
          ) : null}
          {(category?.toLowerCase().includes('guide') || article.title?.toLowerCase().includes('guide') || article.title?.toLowerCase().includes('how to')) ? (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--accent))]/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              Guide
            </span>
          ) : null}
          {(article.title?.toLowerCase().includes('best') || article.title?.toLowerCase().includes('meilleur')) ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black backdrop-blur-sm">
              Best 2026
            </span>
          ) : null}
        </div>
      </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          {dateLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-token-text/55">
              {dateLabel}
            </p>
          ) : null}

          <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-xl [letter-spacing:var(--heading-tracking)]">
            {article.title}
          </h2>

          {article.description ? (
            <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-token-text/75">
              {article.description}
            </p>
          ) : null}

          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] group-hover:underline">
            Lire l'article
            <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
