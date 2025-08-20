// src/lib/sitemap.ts
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


const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'


export function withBase(path: string) {
return new URL(path, BASE).toString()
}


export function buildStaticSitemap() {
const now = new Date().toISOString()
return staticRoutes.map((path) => ({
url: withBase(path),
lastmod: now,
changefreq: path === '/' ? 'daily' : 'weekly',
priority: path === '/' ? 1.0 : 0.6,
}))
}