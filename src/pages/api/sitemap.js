export default async function handler(req, res) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const locales = ['fr', 'en']
  const staticPages = ['', 'a-propos', 'contact', 'panier', 'wishlist', 'blog']

  let urls = locales.flatMap(locale =>
    staticPages.map(page => `${baseUrl}/${locale}/${page}`)
  )

  // Add dynamic product slugs (optional example)
  try {
    const { default: dbConnect } = await import('@/lib/dbConnect')
    const { default: Product } = await import('@/models/Product')
    await dbConnect()

    const products = await Product.find().select('slug')
    products.forEach(p => {
      locales.forEach(locale => {
        urls.push(`${baseUrl}/${locale}/produit/${p.slug}`)
      })
    })
  } catch (err) {
    console.warn('⚠️ Produits non inclus dans sitemap (non bloquant)')
  }

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
