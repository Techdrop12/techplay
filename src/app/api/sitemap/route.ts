import { staticRoutes } from '@/lib/sitemap'
import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://techplay.fr'

  const urls = staticRoutes.map((route) => {
    return `<url><loc>${baseUrl}${route}</loc></url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
