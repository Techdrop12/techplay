import fs from 'fs'

const urls = [
  '',
  'contact',
  'blog',
  'categorie/accessoires',
  'produit/exemple-1',
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `<url><loc>https://www.techplay.fr/${u}</loc></url>`)
  .join('\n')}\n</urlset>`

fs.writeFileSync('public/sitemap.xml', sitemap)
