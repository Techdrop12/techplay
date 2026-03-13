// src/lib/meta.ts
// SEO meta defaults + helpers (TS only). Fallback description intégré.

export type MetaDefaults = {
  title: string
  description: string
  image: string
  type: 'website' | 'article' | 'product'
  locale: string
  siteName?: string
  twitterCard?: 'summary' | 'summary_large_image'
}

import { BRAND } from './constants'

const SITE_NAME = BRAND.NAME

export const defaultMeta: MetaDefaults = {
  title: `${SITE_NAME} — Boutique high-tech`,
  description: 'Découvrez les meilleurs gadgets et accessoires tech du moment.',
  image: '/og-image.jpg',
  type: 'website',
  locale: 'fr_FR',
  siteName: SITE_NAME,
  twitterCard: 'summary_large_image',
}

export function buildMeta(overrides: Partial<MetaDefaults> = {}): MetaDefaults {
  return { ...defaultMeta, ...overrides }
}

type ProductLite = {
  title?: string
  brand?: string
  description?: string
  price?: number | string
  currency?: string
}

export function stripHtml(s: string): string {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function trimToLength(value: string, maxLen: number): string {
  const clean = stripHtml(value)
  if (clean.length <= maxLen) return clean

  const sliced = clean.slice(0, Math.max(0, maxLen - 1))
  const lastSpace = sliced.lastIndexOf(' ')
  const safe = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced

  return `${safe.trim()}…`
}

export function getFallbackDescription(
  product: ProductLite = {},
  {
    siteName = SITE_NAME,
    locale = 'fr-FR',
    maxLen = 160,
  }: { siteName?: string; locale?: string; maxLen?: number } = {}
): string {
  const { title, brand, description, price, currency = 'EUR' } = product
  const isEnglish = String(locale).toLowerCase().startsWith('en')

  const parts: string[] = []

  if (title) {
    parts.push(isEnglish ? `Discover ${title}` : `Découvrez ${title}`)
  }

  if (brand) {
    parts.push(isEnglish ? `from ${brand}` : `de la marque ${brand}`)
  }

  if (price != null && String(price).trim() !== '') {
    try {
      const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency })
      parts.push(isEnglish ? `from ${fmt.format(Number(price))}` : `à partir de ${fmt.format(Number(price))}`)
    } catch {
      // no-op
    }
  }

  const intro = parts.join(' ').trim()
  const baseLine = intro
    ? `${intro}${isEnglish ? ` on ${siteName}. Fast delivery and premium support.` : ` sur ${siteName}. Livraison rapide et SAV premium.`}`
    : isEnglish
      ? `Discover our products on ${siteName}.`
      : `Découvrez nos produits sur ${siteName}.`

  const cleanDescription =
    typeof description === 'string' && description.trim() ? stripHtml(description) : ''

  const composed = cleanDescription ? `${baseLine} ${cleanDescription}` : baseLine
  return trimToLength(composed, maxLen)
}