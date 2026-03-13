'use client'

// src/components/JsonLd/ArticleJsonLd.tsx
import React from 'react'

import type { BlogPost } from '@/types/blog'

import { BRAND } from '@/lib/constants'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

type BlogPostJsonLd = BlogPost & {
  createdAt?: string | number | Date
  updatedAt?: string | number | Date
  author?: string
  image?: string
}

interface ArticleJsonLdProps {
  post: BlogPostJsonLd
}

function iso(d?: string | number | Date): string | undefined {
  if (!d) return undefined
  const x = d instanceof Date ? d : new Date(d)
  return Number.isFinite(x.getTime()) ? x.toISOString() : undefined
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const siteUrl = BRAND.URL
  const locale = getCurrentLocale()
  const pagePath = localizePath(`/blog/${post.slug}`, locale)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: iso(post.createdAt) || iso(Date.now()),
    dateModified: iso(post.updatedAt) || iso(post.createdAt) || iso(Date.now()),
    author: {
      '@type': 'Person',
      name: post.author || 'TechPlay',
    },
    image: {
      '@type': 'ImageObject',
      url: post.image || `${siteUrl}/placeholder.png`,
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