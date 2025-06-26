// ✅ src/pages/api/rss.js

import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();
  const articles = await Blog.find({ published: true }).sort({ publishedAt: -1 }).lean();

  let rss = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel>
    <title>TechPlay Blog</title>
    <link>${process.env.NEXT_PUBLIC_SITE_URL}/blog</link>
    <description>Actualités tech, conseils et guides par TechPlay</description>
  `;

  for (const a of articles) {
    rss += `
      <item>
        <title>${a.title}</title>
        <link>${process.env.NEXT_PUBLIC_SITE_URL}/blog/${a.slug}</link>
        <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
        <description><![CDATA[${a.description}]]></description>
      </item>
    `;
  }
  rss += `</channel></rss>`;

  res.setHeader('Content-Type', 'application/rss+xml');
  res.status(200).send(rss);
}
