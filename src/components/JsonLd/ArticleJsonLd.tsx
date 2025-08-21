'use client'

import type { BlogPost } from '@/types/blog'
import React from 'react'

interface ArticleJsonLdProps {
  post: BlogPost
}

function iso(d?: unknown): string | undefined {
  if (!d) return undefined
  const x = d instanceof Date ? d : new Date(d as any)
  return Number.isFinite(x.getTime()) ? x.toISOString() : undefined
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.techplay.fr'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: iso((post as any).createdAt) || iso(Date.now()),
    dateModified: iso((post as any).updatedAt) || iso((post as any).createdAt) || iso(Date.now()),
    author: {
      '@type': 'Person',
      name: (post as any).author || 'TechPlay',
    },
    image: {
      '@type': 'ImageObject',
      url: (post as any).image || `${siteUrl}/placeholder.png`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechPlay',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
