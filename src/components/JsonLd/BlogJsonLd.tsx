'use client'

import type { BlogPost } from '@/types/blog'
import React from 'react'

interface BlogJsonLdProps {
  posts: BlogPost[]
  locale?: string
  siteUrl?: string
}

function iso(d?: unknown): string | undefined {
  if (!d) return undefined
  const x = d instanceof Date ? d : new Date(d as any)
  return Number.isFinite(x.getTime()) ? x.toISOString() : undefined
}

export default function BlogJsonLd({
  posts = [],
  locale = 'fr',
  siteUrl = 'https://www.techplay.fr',
}: BlogJsonLdProps) {
  if (!Array.isArray(posts) || posts.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url: `${siteUrl}/${locale}/blog`,
    name: locale === 'fr' ? 'Blog TechPlay' : 'TechPlay Blog',
    description:
      locale === 'fr'
        ? 'Actualités, conseils et tendances high-tech sélectionnés par l’équipe TechPlay.'
        : 'Tech news, advice, and trending topics curated by the TechPlay team.',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
      ...(iso((post as any).createdAt) && { datePublished: iso((post as any).createdAt) }),
      author: {
        '@type': 'Person',
        name: (post as any).author || 'TechPlay',
      },
    })),
    publisher: {
      '@type': 'Organization',
      name: 'TechPlay',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
