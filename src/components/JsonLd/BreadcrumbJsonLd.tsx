'use client'

import Head from 'next/head'

interface BreadcrumbJsonLdProps {
  items: { name: string; path: string }[]
  siteUrl?: string
}

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'

export default function BreadcrumbJsonLd({ items, siteUrl = ORIGIN }: BreadcrumbJsonLdProps) {
  if (!items?.length) return null

  const abs = (p: string) => {
    try {
      // si déjà absolu, garde
      new URL(p)
      return p
    } catch {
      return new URL(p.startsWith('/') ? p : `/${p}`, siteUrl).toString()
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  )
}
