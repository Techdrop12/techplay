// ✅ src/pages/api/sitemap.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();
  const products = await Product.find({}).lean();
  const articles = await Blog.find({ published: true }).lean();

  let urls = [
    '',
    '/a-propos',
    '/contact',
    '/blog',
    '/wishlist',
    '/cgv',
    '/panier',
  ];

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr';

  products.forEach((p) => {
    urls.push(`/produit/${p.slug}`);
  });

  articles.forEach((a) => {
    urls.push(`/blog/${a.slug}`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url><loc>${base}${u}</loc><changefreq>weekly</changefreq></url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}
