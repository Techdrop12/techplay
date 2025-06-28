// ✅ /src/pages/api/rss.js (flux RSS automatique du blog)
import { getPublishedArticles } from '@/lib/blog';

export default async function handler(req, res) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.fr';
  try {
    const articles = await getPublishedArticles();
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>TechPlay Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Nouveautés TechPlay – High Tech, Gadgets, Astuces</description>
    ${articles.map(article => `
      <item>
        <title>${article.title}</title>
        <link>${baseUrl}/blog/${article.slug}</link>
        <description>${article.summary || ''}</description>
        <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      </item>
    `).join('')}
  </channel>
</rss>`;
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(rss);
  } catch (e) {
    res.status(500).send('Erreur RSS');
  }
}
