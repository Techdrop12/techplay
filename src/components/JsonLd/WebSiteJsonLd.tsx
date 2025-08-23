'use client'

import Head from 'next/head'

interface Props {
  siteName?: string
  siteUrl?: string
  searchPath?: string // ex: '/search?q={search_term_string}'
}

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'

export default function WebSiteJsonLd({
  siteName = SITE_NAME,
  siteUrl = ORIGIN,
  searchPath = '/search?q={search_term_string}',
}: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: new URL(searchPath, siteUrl).toString(),
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  )
}
