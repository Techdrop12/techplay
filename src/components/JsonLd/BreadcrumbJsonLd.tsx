'use client'

import Head from 'next/head'

import { BRAND } from '@/lib/constants'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

interface BreadcrumbJsonLdProps {
  items: { name: string; path: string }[]
  siteUrl?: string
}

export default function BreadcrumbJsonLd({ items, siteUrl = BRAND.URL }: BreadcrumbJsonLdProps) {
  if (!items?.length) return null
  const locale = getCurrentLocale()

  const abs = (p: string) => {
    try {
      // si déjà absolu, garde
      new URL(p)
      return p
    } catch {
      const localized = localizePath(p.startsWith('/') ? p : `/${p}`, locale)
      return `${siteUrl}${localized}`
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
