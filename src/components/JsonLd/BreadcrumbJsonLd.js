// ✅ BreadcrumbJsonLd.js
'use client'

import Head from 'next/head'

export default function BreadcrumbJsonLd({ pathSegments }) {
  if (!pathSegments || !Array.isArray(pathSegments)) return null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pathSegments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.label,
      item: segment.url,
    })),
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  )
}
