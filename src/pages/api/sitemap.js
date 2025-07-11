export default async function handler(req, res) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr';
  const locales = ['fr', 'en'];
  const staticPages = ['', 'a-propos', 'contact', 'panier', 'wishlist', 'blog', 'cgv'];

  let urls = [];

  // Pages statiques par langue
  locales.forEach(locale => {
    staticPages.forEach(page => {
      urls.push(`${baseUrl}/${locale}/${page}`);
    });
  });

  try {
    const { default: dbConnect } = await import('@/lib/dbConnect');
    const { default: Product } = await import('@/models/Product');
    const { default: Blog } = await import('@/models/Blog');
    await dbConnect();

    const products = await Product.find({}, 'slug updatedAt');
    const blogs = await Blog.find({ published: true }, 'slug updatedAt');

    products.forEach(p => {
      locales.forEach(locale => {
        urls.push({
          loc: `${baseUrl}/${locale}/produit/${p.slug}`,
          lastmod: new Date(p.updatedAt).toISOString()
        });
      });
    });

    blogs.forEach(b => {
      locales.forEach(locale => {
        urls.push({
          loc: `${baseUrl}/${locale}/blog/${b.slug}`,
          lastmod: new Date(b.updatedAt).toISOString()
        });
      });
    });
  } catch (err) {
    console.warn('⚠️ Contenu dynamique non inclus dans sitemap (non bloquant)', err);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(u =>
    typeof u === 'string'
      ? `<url><loc>${u}</loc><changefreq>weekly</changefreq></url>`
      : `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq></url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).end(sitemap);
}
