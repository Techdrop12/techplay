// src/app/api/sitemap/route.ts — uses lib/sitemap (no URLs hardcoded)
import { NextResponse } from 'next/server'
import { buildStaticSitemap, entriesToXml } from '@/lib/sitemap'

export const runtime = 'edge'          // rapide, pas de dépendance Node
export const revalidate = 3600         // 1h de cache ISR

export async function GET() {
  // Ici, on pourrait concaténer des URLs dynamiques (produits, articles, catégories)
  // const dynamicEntries = await fetchWhatever()
  const entries = buildStaticSitemap() // [...buildStaticSitemap(), ...dynamicEntries]
  const xml = entriesToXml(entries)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
    },
  })
}
