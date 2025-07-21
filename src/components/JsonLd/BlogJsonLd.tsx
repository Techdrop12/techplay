'use client'

import Head from 'next/head'
import type { BlogPost } from '@/types/blog'

interface BlogJsonLdProps {
  posts: BlogPost[]
  locale?: string
  siteUrl?: string
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
    blogPost: posts.map((post) => {
      const date =
        typeof post.createdAt === 'string'
          ? post.createdAt
          : post.createdAt instanceof Date
            ? post.createdAt.toISOString()
            : undefined

      return {
        '@type': 'BlogPosting',
        headline: post.title,
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        ...(date && { datePublished: date }),
        author: {
          '@type': 'Person',
          name: post.author || 'TechPlay',
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
