'use client'

// src/components/JsonLd/ArticleJsonLd.tsx
import type { BlogPost } from '@/types/blog'
import React from 'react'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

interface ArticleJsonLdProps {
  post: BlogPost
}

function iso(d?: unknown): string | undefined {
  if (!d) return undefined
  const x = d instanceof Date ? d : new Date(d as any)
  return Number.isFinite(x.getTime()) ? x.toISOString() : undefined
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const RAW = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.techplay.fr'
  const siteUrl = RAW.replace(/\/+$/, '')
  const locale = getCurrentLocale()
  const pagePath = localizePath(`/blog/${post.slug}`, locale)

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
      '@id': `${siteUrl}${pagePath}`,
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
