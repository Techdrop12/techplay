// src/lib/seo.ts — Générateur de metadata Next robuste (canonical, hreflang, OG, Twitter, JSON-LD)
import { BRAND } from './constants'

import type { Metadata } from 'next'

type SiteLocale = 'fr' | 'en'
type OgLocale = 'fr_FR' | 'en_US'
type MetaOgType = 'website' | 'article'

interface MetaProps {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article' | 'product'
  locale?: OgLocale
  noindex?: boolean
}

interface ArticleMetaExtras {
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
}

interface ProductMetaExtras {
  price?: { amount: number; currency: string }
  sku?: string
  brand?: string
}

const RAW_ORIGIN = BRAND.URL
const SITE_NAME = BRAND.NAME
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@techplay'
const DEFAULT_OG = '/og-image.jpg'
const DEFAULT_LOCALE: SiteLocale = 'fr'

function getOrigin(): string {
  try {
    return new URL(RAW_ORIGIN).origin
  } catch {
    return 'https://techplay.example.com'
  }
}

const ORIGIN = getOrigin()

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(fr|en)(?=\/|$)/, '') || '/'
}

function inferLocaleFromPath(pathname: string): SiteLocale {
  const match = pathname.match(/^\/(fr|en)(?=\/|$)/)
  return match?.[1] === 'en' ? 'en' : DEFAULT_LOCALE
}

function toOgLocale(locale: SiteLocale): OgLocale {
  return locale === 'en' ? 'en_US' : 'fr_FR'
}

function abs(u?: string | null, fallback: string = DEFAULT_OG): string {
  const raw = (u || '').trim()
  const effective = raw || fallback

  try {
    return new URL(effective).toString()
  } catch {
    const path = ensureLeadingSlash(effective)
    return `${ORIGIN}${path}`
  }
}

function resolvePathnameFromUrl(url: string): string {
  try {
    return new URL(url).pathname || '/'
  } catch {
    try {
      return new URL(abs(url)).pathname || '/'
    } catch {
      return ensureLeadingSlash(url.split('?')[0]?.split('#')[0] || '/')
    }
  }
}

function buildLanguageAlternates(pathname: string): NonNullable<Metadata['alternates']>['languages'] {
  const pathNoLocale = stripLocalePrefix(pathname) || '/'
  const frPath = pathNoLocale
  const enPath = pathNoLocale === '/' ? '/en' : `/en${pathNoLocale}`

  return {
    fr: frPath,
    en: enPath,
    'x-default': '/',
  }
}

function toOpenGraphType(type: MetaProps['type']): MetaOgType {
  return type === 'article' ? 'article' : 'website'
}

function buildOpenGraph(input: {
  title: string
  description: string
  canonicalUrl: string
  imageAbs: string
  locale: OgLocale
  type: MetaOgType
  extras?: Partial<{
    publishedTime: string
    modifiedTime: string
    authors: string[]
    section: string
    tags: string[]
  }>
}): NonNullable<Metadata['openGraph']> {
  const { title, description, canonicalUrl, imageAbs, locale, type, extras } = input

  return {
    title,
    description,
    type,
    locale,
    alternateLocale: locale === 'fr_FR' ? ['en_US'] : ['fr_FR'],
    url: canonicalUrl,
    siteName: SITE_NAME,
    images: [
      {
        url: imageAbs,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    ...(type === 'article'
      ? {
          ...(extras?.publishedTime ? { publishedTime: extras.publishedTime } : {}),
          ...(extras?.modifiedTime ? { modifiedTime: extras.modifiedTime } : {}),
          ...(extras?.authors?.length ? { authors: extras.authors } : {}),
          ...(extras?.section ? { section: extras.section } : {}),
          ...(extras?.tags?.length ? { tags: extras.tags } : {}),
        }
      : {}),
  }
}

export function generateMeta({
  title,
  description,
  url,
  image = DEFAULT_OG,
  type = 'website',
  locale,
  noindex = false,
}: MetaProps): Metadata {
  const canonicalAbs = abs(url)
  const pathname = resolvePathnameFromUrl(url)
  const siteLocale = inferLocaleFromPath(pathname)
  const ogLocale = locale ?? toOgLocale(siteLocale)
  const imageAbs = abs(image)
  const languages = buildLanguageAlternates(pathname)

  return {
    title,
    description,
    metadataBase: new URL(ORIGIN),
    alternates: {
      canonical: canonicalAbs,
      languages,
    },
    robots: noindex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            'max-snippet': -1,
            'max-video-preview': -1,
            'max-image-preview': 'large',
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
    openGraph: buildOpenGraph({
      title,
      description,
      canonicalUrl: canonicalAbs,
      imageAbs,
      locale: ogLocale,
      type: toOpenGraphType(type),
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageAbs],
      site: TWITTER_HANDLE,
    },
  }
}

export function generateArticleMeta(base: MetaProps, extras: ArticleMetaExtras = {}): Metadata {
  const canonicalAbs = abs(base.url)
  const pathname = resolvePathnameFromUrl(base.url)
  const siteLocale = inferLocaleFromPath(pathname)
  const ogLocale = base.locale ?? toOgLocale(siteLocale)
  const imageAbs = abs(base.image || DEFAULT_OG)

  return {
    ...generateMeta({ ...base, type: 'article' }),
    openGraph: buildOpenGraph({
      title: base.title,
      description: base.description,
      canonicalUrl: canonicalAbs,
      imageAbs,
      locale: ogLocale,
      type: 'article',
      extras,
    }),
  }
}

export function generateProductMeta(
  base: MetaProps,
  extras: ProductMetaExtras = {}
): Metadata {
  const meta = generateMeta({ ...base, type: 'product' })

  return {
    ...meta,
    other: {
      ...(typeof extras.price?.amount === 'number'
        ? {
            'product:price:amount': String(extras.price.amount),
            'product:price:currency': extras.price.currency,
          }
        : {}),
      ...(extras.sku ? { 'product:retailer_item_id': extras.sku } : {}),
      ...(extras.brand ? { 'product:brand': extras.brand } : {}),
    },
  }
}

export function jsonLdBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  }
}

export function jsonLdArticle(params: {
  headline: string
  description: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  authorName?: string | string[]
  publisherName?: string
  publisherLogo?: string
}) {
  const authors = Array.isArray(params.authorName)
    ? params.authorName
    : params.authorName
      ? [params.authorName]
      : []

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    url: abs(params.url),
    image: params.image ? [abs(params.image)] : [abs(DEFAULT_OG)],
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    author: authors.map((name) => ({ '@type': 'Person', name })),
    publisher: params.publisherName
      ? {
          '@type': 'Organization',
          name: params.publisherName,
          ...(params.publisherLogo
            ? {
                logo: {
                  '@type': 'ImageObject',
                  url: abs(params.publisherLogo),
                },
              }
            : {}),
        }
      : undefined,
  }
}

export function jsonLdProduct(params: {
  name: string
  description: string
  url: string
  image?: string | string[]
  sku?: string
  brand?: string
  price?: { amount: number; currency: string }
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}) {
  const images = Array.isArray(params.image)
    ? params.image.map((u) => abs(u))
    : params.image
      ? [abs(params.image)]
      : [abs(DEFAULT_OG)]

  const offers = params.price
    ? {
        '@type': 'Offer',
        priceCurrency: params.price.currency,
        price: params.price.amount,
        availability: params.availability
          ? `https://schema.org/${params.availability}`
          : undefined,
        url: abs(params.url),
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    sku: params.sku,
    brand: params.brand ? { '@type': 'Brand', name: params.brand } : undefined,
    image: images,
    offers,
  }
}

/** ItemList JSON-LD pour pages liste (catégories, catalogue, blog). */
export function jsonLdItemList(params: {
  name: string
  description?: string
  url: string
  items: Array<{ name: string; url: string }>
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: params.name,
    ...(params.description ? { description: params.description } : {}),
    url: abs(params.url),
    numberOfItems: params.items.length,
    itemListElement: params.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  }
}

export { ORIGIN, SITE_NAME, TWITTER_HANDLE, abs as absoluteUrl }