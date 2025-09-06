'use client'

import Head from 'next/head'
import type { BlogPost } from '@/types/blog'
import React from 'react'
import { localizePath, type Locale } from '@/lib/i18n-routing'

interface BlogJsonLdProps {
  posts: BlogPost[]
  locale?: Locale
  siteUrl?: string
}

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

function iso(d?: unknown): string | undefined {
  if (!d) return undefined
  const x = d instanceof Date ? d : new Date(d as any)
  return Number.isFinite(x.getTime()) ? x.toISOString() : undefined
}

export default function BlogJsonLd({
  posts = [],
  locale = 'fr' as Locale,
  siteUrl = ORIGIN,
}: BlogJsonLdProps) {
  if (!Array.isArray(posts) || posts.length === 0) return null

  const blogPath = localizePath('/blog', locale)
  const blogUrl = `${siteUrl}${blogPath}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': blogUrl,
    url: blogUrl,
    name: locale === 'fr' ? 'Blog TechPlay' : 'TechPlay Blog',
    description:
      locale === 'fr'
        ? 'Actualités, conseils et tendances high-tech sélectionnés par l’équipe TechPlay.'
        : 'Tech news, advice, and trending topics curated by the TechPlay team.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    blogPost: posts.map((post) => {
      const postUrl = `${siteUrl}${localizePath(`/blog/${post.slug}`, locale)}`
      return {
        '@type': 'BlogPosting',
        headline: post.title,
        url: postUrl,
        ...(iso((post as any).createdAt) && { datePublished: iso((post as any).createdAt) }),
        ...(iso((post as any).updatedAt) && { dateModified: iso((post as any).updatedAt) }),
        author: {
          '@type': 'Person',
          name: (post as any).author || 'TechPlay',
        },
      }
    }),
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
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  )
}
