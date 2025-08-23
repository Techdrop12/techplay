// src/lib/sitemap.ts — single source of truth (static entries + helpers)

export type ChangeFreq =
  | 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export type SitemapEntry = {
  url: string
  lastmod?: string
  changefreq?: ChangeFreq
  priority?: number
}

export const staticRoutes = [
  '/',
  '/produit',
  '/pack',
  '/wishlist',
  '/commande',
  '/confidentialite',
  '/mentions-legales',
  '/cgv',
] as const
export type StaticRoute = (typeof staticRoutes)[number]

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  'https://techplay.fr'

export function withBase(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${p}`
}

export function buildStaticSitemap(): SitemapEntry[] {
  const now = new Date().toISOString()
  return staticRoutes.map((p) => ({
    url: withBase(p),
    lastmod: now,
    changefreq: p === '/' ? 'daily' : 'weekly',
    priority: p === '/' ? 1.0 : 0.6,
  }))
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
