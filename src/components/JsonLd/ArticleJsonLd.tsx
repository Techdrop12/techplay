'use client'

import Head from 'next/head'
import type { BlogPost } from '@/types/blog'

interface ArticleJsonLdProps {
  post: BlogPost
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.techplay.fr'

  const createdDate =
    typeof post.createdAt === 'string' || post.createdAt instanceof Date
      ? new Date(post.createdAt).toISOString()
      : new Date().toISOString()

  const modifiedDate =
    typeof (post as any).updatedAt === 'string' || (post as any).updatedAt instanceof Date
      ? new Date((post as any).updatedAt).toISOString()
      : createdDate

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: createdDate,
    dateModified: modifiedDate,
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
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  )
}
