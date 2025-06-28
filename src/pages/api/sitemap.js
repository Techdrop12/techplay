// ✅ /src/pages/api/sitemap.js (génération sitemap.xml dynamique pour SEO)
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.fr';
  await dbConnect();
  try {
    const products = await Product.find({}).lean();
    const blogs = await Blog.find({ published: true }).lean();

    const staticRoutes = [
      '', '/a-propos', '/contact', '/categorie', '/blog', '/cgv', '/panier'
    ];
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static
    staticRoutes.forEach(route => {
      sitemap += `  <url><loc>${baseUrl}${route ? `/${route}` : ''}</loc></url>\n`;
    });
    // Products
    products.forEach(prod => {
      sitemap += `  <url><loc>${baseUrl}/produit/${prod.slug}</loc></url>\n`;
    });
    // Blogs
    blogs.forEach(blog => {
      sitemap += `  <url><loc>${baseUrl}/blog/${blog.slug}</loc></url>\n`;
    });

    sitemap += `</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (e) {
    res.status(500).send('Erreur sitemap');
  }
}
