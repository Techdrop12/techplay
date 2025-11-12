// src/lib/seo.ts — Générateur de metadata Next (hreflang, OG absolus, noindex, helpers)
import type { Metadata } from 'next'

type SiteLocale = 'fr' | 'en'
type OpenGraphType = 'website' | 'article'

interface MetaProps {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article' | 'product'
  locale?: 'fr_FR' | 'en_US'
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

const RAW_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@techplay'
const DEFAULT_OG = '/og-image.jpg'
const DEFAULT_LOCALE: SiteLocale = 'fr'

function getOrigin(): string {
  try {
    const u = new URL(RAW_ORIGIN)
    return u.origin
  } catch {
    return 'https://techplay.example.com'
  }
}
const ORIGIN = getOrigin()

function abs(u?: string | null, fallback: string = DEFAULT_OG): string {
  const v = (u || '').trim()
  const effective = v || fallback
  try {
    return new URL(effective).toString()
  } catch {
    const path = effective.startsWith('/') ? effective : `/${effective}`
    return `${ORIGIN}${path}`
  }
}

const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`)
const stripLocalePrefix = (pathname: string) => pathname.replace(/^\/(fr|en)(?=\/|$)/, '')
const toHreflang = (loc: SiteLocale) => (loc === 'fr' ? 'fr-FR' : 'en-US')

function inferLocaleFromPath(pathname: string): SiteLocale {
  const m = pathname.match(/^\/(fr|en)(?=\/|$)/)
  return (m?.[1] as SiteLocale) || DEFAULT_LOCALE
}

const toOgLocale = (loc: SiteLocale): 'fr_FR' | 'en_US' => (loc === 'en' ? 'en_US' : 'fr_FR')

function buildLanguageAlternates(pathname: string) {
  const pathNoLocale = stripLocalePrefix(pathname) || '/'
  const frPath = pathNoLocale
  const enPath = pathNoLocale === '/' ? '/en' : `/en${pathNoLocale}`
  return {
    [toHreflang('fr')]: frPath,
    [toHreflang('en')]: enPath,
    'x-default': '/',
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

  let pathname = '/'
  try {
    pathname = new URL(canonicalAbs).pathname || '/'
  } catch {
    pathname = ensureLeadingSlash(url)
  }

  const siteLocale = inferLocaleFromPath(pathname)
  const ogLocale = (locale ?? toOgLocale(siteLocale)) as 'fr_FR' | 'en_US'
  const languages = buildLanguageAlternates(pathname)
  const imageAbs = abs(image)
  const ogType: OpenGraphType = type === 'article' ? 'article' : 'website'

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
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            'max-snippet': -1,
            'max-video-preview': -1,
            'max-image-preview': 'none',
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    openGraph: {
      title,
      description,
      type: ogType,
      locale: ogLocale,
      url: canonicalAbs,
      siteName: SITE_NAME,
      images: [{ url: imageAbs }],
    },
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
  const m = generateMeta({ ...base, type: 'article' })
  const { publishedTime, modifiedTime, authors, section, tags } = extras
  return {
    ...m,
    openGraph: {
      ...m.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors,
      section,
      tags,
    } as unknown,
  }
}

export function generateProductMeta(base: MetaProps, _extras: ProductMetaExtras = {}): Metadata {
  return generateMeta({ ...base, type: 'product' })
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
  const authors = Array.isArray(params.authorName) ? params.authorName : [params.authorName].filter(Boolean) as string[]
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    url: abs(params.url),
    image: params.image ? [abs(params.image)] : [abs(DEFAULT_OG)],
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    author: authors.map((a) => ({ '@type': 'Person', name: a })),
    publisher: params.publisherName
      ? {
          '@type': 'Organization',
          name: params.publisherName,
          logo: params.publisherLogo ? { '@type': 'ImageObject', url: abs(params.publisherLogo) } : undefined,
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
  const images = Array.isArray(params.image) ? params.image.map((u) => abs(u)) : params.image ? [abs(params.image)] : [abs(DEFAULT_OG)]
  const offers =
    params.price
      ? {
          '@type': 'Offer',
          priceCurrency: params.price.currency,
          price: params.price.amount,
          availability: params.availability ? `https://schema.org/${params.availability}` : undefined,
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

export { ORIGIN, SITE_NAME, TWITTER_HANDLE }

