import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  try {
    await dbConnect();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr';

    const articles = await Blog.find({ published: true }).sort({ publishedAt: -1 }).lean();

    const rssItems = articles.map((a) => `
      <item>
        <title><![CDATA[${a.title}]]></title>
        <link>${baseUrl}/blog/${a.slug}</link>
        <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
        <description><![CDATA[${a.description || a.summary || ''}]]></description>
      </item>
    `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>TechPlay Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Actualités tech, gadgets et innovations – par TechPlay</description>
    <language>fr-fr</language>
    ${rssItems}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml');
    res.status(200).send(rss);
  } catch (error) {
    console.error('❌ Erreur génération RSS:', error);
    res.status(500).end();
  }
}
