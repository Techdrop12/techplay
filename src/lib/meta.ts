// src/lib/meta.ts
// SEO meta defaults + helpers (TS only). Fallback description intégré.

export type MetaDefaults = {
  title: string
  description: string
  image: string
  type: 'website' | 'article' | 'product'
  locale: string // ex: 'fr_FR' | 'en_US'
  siteName?: string
  twitterCard?: 'summary' | 'summary_large_image'
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'

export const defaultMeta: MetaDefaults = {
  title: `${SITE_NAME} — Boutique high-tech`,
  description: 'Découvrez les meilleurs gadgets et accessoires tech du moment.',
  image: '/og-image.jpg',
  type: 'website',
  locale: 'fr_FR',
  siteName: SITE_NAME,
  twitterCard: 'summary_large_image',
}

/** Merge simple avec valeurs par défaut. */
export function buildMeta(overrides: Partial<MetaDefaults> = {}): MetaDefaults {
  return { ...defaultMeta, ...overrides }
}

/* -------------------------------------------------------------------------- */
/*                               Fallback helpers                              */
/* -------------------------------------------------------------------------- */

type ProductLite = {
  title?: string
  brand?: string
  description?: string
  price?: number | string
  currency?: string // ex: 'EUR'
}

/** Nettoie le HTML et compacte les espaces. */
export function stripHtml(s: string): string {
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Génère une meta description “de secours” à partir d’un produit.
 * - Ajoute titre/brand/prix si disponibles
 * - Ajoute un snippet de description propre (≤ 160 chars)
 */
export function getFallbackDescription(
  product: ProductLite = {},
  {
    siteName = SITE_NAME,
    locale = 'fr-FR',
    maxLen = 160,
  }: { siteName?: string; locale?: string; maxLen?: number } = {}
): string {
  const { title, brand, description, price, currency = 'EUR' } = product
  let parts: string[] = []
  if (title) parts.push(`Découvrez ${title}`)
  if (brand) parts.push(`de la marque ${brand}`)

  let out = parts.join(' ')
  // prix
  if (price != null && String(price) !== '') {
    try {
      const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency })
      out += (out ? ' ' : '') + `à partir de ${fmt.format(Number(price))}`
    } catch {
      // silent: pas de currency si Intl échoue
    }
  }
  if (out) out += ` sur ${siteName}. Livraison rapide et SAV premium.`

  // snippet de description
  if (typeof description === 'string' && description.trim()) {
    const clean = stripHtml(description)
    const snippet = clean.length > maxLen ? clean.slice(0, Math.max(0, maxLen - 1)) + '…' : clean
    out += (out ? ' ' : '') + snippet
  }

  return out || `Découvrez nos produits sur ${siteName}.`
}
