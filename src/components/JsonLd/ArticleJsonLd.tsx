'use client'

import Head from 'next/head'
import type { BlogPost } from '@/types/blog'

interface ArticleJsonLdProps {
  post: BlogPost
}

// Convertit en ISO en acceptant string | number | Date | undefined
const toISO = (v: unknown, fallbackISO?: string): string => {
  const d = new Date(v as any)
  return Number.isNaN(d.getTime())
    ? (fallbackISO ?? new Date().toISOString())
    : d.toISOString()
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.techplay.fr'

  const createdDate = toISO((post as any)?.createdAt)
  const modifiedDate = toISO((post as any)?.updatedAt, createdDate)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: createdDate,
    dateModified: modifiedDate,
    author: { '@type': 'Person', name: post.author || 'TechPlay' },
    image: { '@type': 'ImageObject', url: post.image || `${siteUrl}/placeholder.png` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
    publisher: {
      '@type': 'Organization',
      name: 'TechPlay',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
    },
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        // ok: stringifié côté client
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  )
}
