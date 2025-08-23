'use client'

import Head from 'next/head'

type ContactPoint = {
  telephone: string
  contactType: string
  areaServed?: string | string[]
  availableLanguage?: string | string[]
}

interface OrgProps {
  name?: string
  siteUrl?: string
  logoPath?: string
  sameAs?: string[]
  contacts?: ContactPoint[]
}

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'

export default function OrganizationJsonLd({
  name = SITE_NAME,
  siteUrl = ORIGIN,
  logoPath = '/icons/icon-512x512.png',
  sameAs = [
    'https://www.facebook.com/techplay',
    'https://www.instagram.com/techplay',
    'https://www.youtube.com/@techplay',
  ],
  contacts = [
    {
      telephone: '+33-1-23-45-67-89',
      contactType: 'customer support',
      areaServed: 'FR',
      availableLanguage: ['French'],
    },
  ],
}: OrgProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: siteUrl,
    logo: new URL(logoPath, siteUrl).toString(),
    sameAs,
    contactPoint: contacts.map((c) => ({ '@type': 'ContactPoint', ...c })),
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
