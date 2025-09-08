// src/lib/sitemap.ts — i18n-ready (FR default, EN prefix/domain) — FINAL

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export type SitemapEntry = {
  url: string
  lastmod?: string
  changefreq?: ChangeFreq
  priority?: number
}

const ROUTES = [
  '/',                // home
  '/products',        // catalogue
  '/products/packs',  // packs
  '/wishlist',        // page localisée native
  '/commande',        // checkout
  '/blog',
  '/contact',
  '/confidentialite',
  '/mentions-legales',
  '/cgv',
] as const
export type StaticRoute = (typeof ROUTES)[number]

// Domains
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://techplay.fr'

// Optionnel : domaine EN dédié (avec next-intl "domains")
export const SITE_URL_EN =
  process.env.NEXT_PUBLIC_SITE_URL_EN?.replace(/\/+$/, '') || ''

const LOCALES = ['fr', 'en'] as const
type Locale = (typeof LOCALES)[number]

// '/products' -> '/products' (fr), '/en/products' (en) si pas de domaine EN dédié
function pathForLocale(path: string, locale: Locale): string {
  const p = path.startsWith('/') ? path : `/${path}`
  if (locale === 'fr') return p
  // EN :
  if (SITE_URL_EN) return p // domaine séparé -> pas de prefix /en
  return p === '/' ? '/en' : `/en${p}`
}

// URL absolue pour un path + locale
export function withBaseLocale(path: string, locale: Locale): string {
  const base = locale === 'en' && SITE_URL_EN ? SITE_URL_EN : SITE_URL
  const localizedPath = pathForLocale(path, locale)
  return `${base}${localizedPath}`
}

export function buildStaticSitemap(): SitemapEntry[] {
  const now = new Date().toISOString()
  const entries: SitemapEntry[] = []

  for (const locale of LOCALES) {
    for (const p of ROUTES) {
      // ✅ pas besoin de re-tester dans la 2e branche du OR, ça casse le narrowing
      const isHome = p === '/'

      entries.push({
        url: withBaseLocale(p, locale),
        lastmod: now,
        changefreq: isHome ? 'daily' : 'weekly',
        priority: isHome ? 1.0 : 0.7,
      })
    }
  }

  return entries
}

/** Convertit des entrées en XML sitemap (urlset). */
export function entriesToXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''
      const changefreq = e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ''
      const priority =
        typeof e.priority === 'number' ? `<priority>${e.priority.toFixed(1)}</priority>` : ''
      return `<url><loc>${escapeXml(e.url)}</loc>${lastmod}${changefreq}${priority}</url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
