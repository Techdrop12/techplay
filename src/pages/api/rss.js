// src/pages/api/rss.js
import { getAllPosts } from '@/lib/blog' // adapte selon ta méthode de récupération blog

export default async function handler(req, res) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const posts = await getAllPosts() // récupérer tous articles blog publiés
    const rssItems = posts.map(post => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${baseUrl}/blog/${post.slug}</link>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <description><![CDATA[${post.summary}]]></description>
      </item>
    `).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>TechPlay - Blog</title>
          <link>${baseUrl}/blog</link>
          <description>Le blog TechPlay sur la tech et gadgets innovants</description>
          <language>fr-fr</language>
          ${rssItems}
        </channel>
      </rss>`

    res.setHeader('Content-Type', 'application/rss+xml')
    res.status(200).send(rss)
  } catch (error) {
    console.error('Erreur génération RSS:', error)
    res.status(500).end()
  }
}
