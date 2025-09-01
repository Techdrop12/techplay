// src/components/SEOHead.tsx — Canonical/hreflang alignés avec FR sans préfixe + EN préfixé
'use client'

// NOTE: À n’utiliser que sur les rares pages qui n’emploient pas l’API Metadata.

import Head from 'next/head'

type OgType = 'website' | 'article' | 'product'
type Locale = 'fr' | 'en'

interface Props {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: OgType
  locale?: Locale
  noindex?: boolean
  nofollow?: boolean
  publishedTime?: string
  modifiedTime?: string
  prevUrl?: string
  nextUrl?: string
  imageAlt?: string
}

// 🔒 ORIGIN normalisé (https + pas de trailing slash) pour éviter les canoniques invalides
const RAW_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').trim()
const ORIGIN = (
  /^https?:\/\//i.test(RAW_ORIGIN) ? RAW_ORIGIN : `https://${RAW_ORIGIN}`
).replace(/\/+$/, '')

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@techplay'

function absUrl(input?: string): string | undefined {
  if (!input) return undefined
  try {
    return new URL(input).toString()
  } catch {
    try {
      return new URL(input.startsWith('/') ? input : `/${input}`, ORIGIN).toString()
    } catch {
      return undefined
    }
  }
}

function currentPathname(): string {
  if (typeof window === 'undefined') return '/'
  try {
    return window.location.pathname + window.location.search
  } catch {
    return '/'
  }
}

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(fr|en)(?=\/|$)/, '') || '/'
}

function detectLocaleFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'fr'
}

export default function SEOHead({
  title = `${SITE_NAME} – Boutique high-tech`,
  description = 'Découvrez les meilleurs gadgets et accessoires technologiques.',
  image = '/og-image.jpg',
  url,
  type = 'website',
  locale,
  noindex = false,
  nofollow = false,
  publishedTime,
  modifiedTime,
  prevUrl,
  nextUrl,
  imageAlt,
}: Props) {
  const pathname = currentPathname()
  const loc: Locale = locale ?? detectLocaleFromPath(pathname)

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  // Canonical: FR sans préfixe, EN avec /en
  const pathNoLocale = stripLocalePrefix((pathname.split('?')[0] || '/') as string)
  const canonicalByLoc = new URL(loc === 'en' ? `/en${pathNoLocale}` : pathNoLocale, ORIGIN).toString()
  const canonicalAbs = absUrl(url) ?? canonicalByLoc

  // Hreflang FR/EN + x-default (pointent vers mêmes chemins "pathNoLocale")
  const hrefFr = new URL(pathNoLocale, ORIGIN).toString()
  const hrefEn = new URL(`/en${pathNoLocale}`, ORIGIN).toString()
  const hrefDefault = hrefFr

  const ogImage = absUrl(image) || absUrl('/og-image.jpg')
  const robots = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1',
  ].join(', ')

  const ogLocale = loc === 'en' ? 'en_US' : 'fr_FR'
  const ogLocaleAlt = loc === 'en' ? 'fr_FR' : 'en_US'
  const fallbackAlt = loc === 'en' ? `${SITE_NAME} – High-tech store` : `${SITE_NAME} – Boutique high-tech`
  const imageAltFinal = imageAlt ?? fallbackAlt

  const prevAbs = absUrl(prevUrl)
  const nextAbs = absUrl(nextUrl)

  return (
    <Head>
      {/* Canonical & hreflang */}
      <link key="canonical" rel="canonical" href={canonicalAbs} />
      <link key="alt-fr" rel="alternate" hrefLang="fr" href={hrefFr} />
      <link key="alt-en" rel="alternate" hrefLang="en" href={hrefEn} />
      <link key="alt-xdef" rel="alternate" hrefLang="x-default" href={hrefDefault} />

      {/* Pagination (si fourni) */}
      {prevAbs ? <link key="prev" rel="prev" href={prevAbs} /> : null}
      {nextAbs ? <link key="next" rel="next" href={nextAbs} /> : null}

      {/* Base meta */}
      <title key="title">{fullTitle}</title>
      <meta key="desc" name="description" content={description} />
      <meta key="robots" name="robots" content={robots} />
      <meta key="googlebot" name="googlebot" content={robots} />

      {/* Open Graph */}
      <meta key="og:title" property="og:title" content={fullTitle} />
      <meta key="og:description" property="og:description" content={description} />
      {ogImage && <meta key="og:image" property="og:image" content={ogImage} />}
      {imageAltFinal && <meta key="og:image:alt" property="og:image:alt" content={imageAltFinal} />}
      <meta key="og:url" property="og:url" content={canonicalAbs} />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content={ogLocale} />
      <meta key="og:locale:alt" property="og:locale:alternate" content={ogLocaleAlt} />

      {/* Article meta si pertinent */}
      {type === 'article' && publishedTime && (
        <meta key="article:published_time" property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta key="article:modified_time" property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta key="tw:card" name="twitter:card" content="summary_large_image" />
      <meta key="tw:title" name="twitter:title" content={fullTitle} />
      <meta key="tw:description" name="twitter:description" content={description} />
      {ogImage && <meta key="tw:image" name="twitter:image" content={ogImage} />}
      <meta key="tw:site" name="twitter:site" content={TWITTER_HANDLE} />
    </Head>
  )
}
