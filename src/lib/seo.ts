// src/lib/seo.ts — ULTIME++ Générateur de metadata Next (hreflang, OG absolus, noindex, helpers)
// Typé, robuste à des URLs relatives/absolues, FR par défaut sur "/" et EN sur "/en".

import type { Metadata } from 'next'

type SiteLocale = 'fr' | 'en'
type OpenGraphType = 'website' | 'article' // (Next n’accepte pas "product" directement)

interface MetaProps {
  title: string
  description: string
  /** URL canonique – relative ("/products") ou absolue ("https://.../products") */
  url: string
  /** OG image – relative ou absolue (défaut: "/og-image.jpg") */
  image?: string
  /** "website" | "article" (note: "product" est mappé vers "website") */
  type?: 'website' | 'article' | 'product'
  /** "fr_FR" | "en_US" — si absent, déduit de l’URL */
  locale?: 'fr_FR' | 'en_US'
  /** Empêche l’indexation si true */
  noindex?: boolean
}

interface ArticleMetaExtras {
  publishedTime?: string // ISO
  modifiedTime?: string  // ISO
  authors?: string[]     // URLs ou noms
  section?: string
  tags?: string[]
}

interface ProductMetaExtras {
  /** Non utilisé directement par Next Metadata (OG "product" non typé), exposé pour JSON-LD éventuel */
  price?: { amount: number; currency: string }
  sku?: string
  brand?: string
}

const RAW_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@techplay'
const DEFAULT_OG = '/og-image.jpg'
const DEFAULT_LOCALE: SiteLocale = 'fr'
const SUPPORTED: readonly SiteLocale[] = ['fr', 'en'] as const

/** Origin normalisée (sans trailing slash, URL valide) */
function getOrigin(): string {
  try {
    const u = new URL(RAW_ORIGIN)
    return `${u.origin}`
  } catch {
    return 'https://techplay.example.com'
  }
}
const ORIGIN = getOrigin()

/** Convertit en URL absolue basée sur ORIGIN si relative */
function abs(u: string | undefined | null, fallback: string = DEFAULT_OG): string {
  const v = (u || '').trim()
  if (!v) return `${ORIGIN}${fallback.startsWith('/') ? fallback : `/${fallback}`}`
  try {
    // déjà absolue
    return new URL(v).toString()
  } catch {
    const path = v.startsWith('/') ? v : `/${v}`
    return `${ORIGIN}${path}`
  }
}

const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`)

/** Supprime préfixe locale /fr ou /en au début du pathname */
const stripLocalePrefix = (pathname: string) => pathname.replace(/^\/(fr|en)(?=\/|$)/, '')

/** Mappe "fr"|"en" -> "fr-FR"|"en-US" */
const toHreflang = (loc: SiteLocale) => (loc === 'fr' ? 'fr-FR' : 'en-US')

/** Déduit la locale de l’URL si possible (sinon "fr") */
function inferLocaleFromPath(pathname: string): SiteLocale {
  const m = pathname.match(/^\/(fr|en)(?=\/|$)/)
  return (m?.[1] as SiteLocale) || DEFAULT_LOCALE
}

/** Map site-locale -> OG locale */
const toOgLocale = (loc: SiteLocale): 'fr_FR' | 'en_US' => (loc === 'en' ? 'en_US' : 'fr_FR')

/** Construit les alternates.languages avec FR sur "/" et EN sur "/en" */
function buildLanguageAlternates(pathname: string) {
  const pathNoLocale = stripLocalePrefix(pathname) || '/'
  const frPath = pathNoLocale // FR = racine
  const enPath = pathNoLocale === '/' ? '/en' : `/en${pathNoLocale}`
  return {
    [toHreflang('fr')]: frPath,
    [toHreflang('en')]: enPath,
    'x-default': '/',
  }
}

/** Générateur principal de metadata */
export function generateMeta({
  title,
  description,
  url,
  image = DEFAULT_OG,
  type = 'website',
  locale, // auto si absent
  noindex = false,
}: MetaProps): Metadata {
  const canonicalAbs = abs(url)

  // Récupère pathname propre pour hreflang et OG locale
  let pathname = '/'
  try {
    pathname = new URL(canonicalAbs).pathname || '/'
  } catch {
    pathname = ensureLeadingSlash(url)
  }

  // Locale OG : auto si non fournie
  const siteLocale = inferLocaleFromPath(pathname)
  const ogLocale = (locale ?? toOgLocale(siteLocale)) as 'fr_FR' | 'en_US'

  const languages = buildLanguageAlternates(pathname)
  const imageAbs = abs(image, DEFAULT_OG)

  // Map "product" => "website" (Next types)
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
          googleBot: { index: false, follow: false, 'max-snippet': -1, 'max-video-preview': -1, 'max-image-preview': 'none' },
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

/** Helper spécifique Article: ajoute les champs OG article */
export function generateArticleMeta(
  base: MetaProps,
  extras: ArticleMetaExtras = {}
): Metadata {
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
    } as any,
  }
}

/** Helper “Product”: conserve type "website" (Next) et expose un bloc à réutiliser pour JSON-LD */
export function generateProductMeta(
  base: MetaProps,
  _extras: ProductMetaExtras = {}
): Metadata {
  // Pour OG, on reste sur type "website". Les détails produit doivent aller en JSON-LD.
  return generateMeta({ ...base, type: 'product' })
}

/** Utilitaires JSON-LD prêts à insérer dans un <script type="application/ld+json"> */
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

// Expose quelques constantes si besoin ailleurs
export { ORIGIN, SITE_NAME, TWITTER_HANDLE }
