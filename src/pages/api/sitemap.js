export default async function handler(req, res) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const locales = ['fr', 'en']
  const staticPages = ['', 'a-propos', 'contact', 'panier']

  let urls = locales.flatMap(locale =>
    staticPages.map(page => `${baseUrl}/${locale}/${page}`)
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(url => `<url><loc>${url}</loc><changefreq>weekly</changefreq></url>`)
    .join('')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.write(sitemap)
  res.end()
}
