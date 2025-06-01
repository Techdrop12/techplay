import { generateBlogPost } from '@/lib/ai-blog'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method !== 'POST') return res.status(405).end()
  const admin = await isAdmin(req)
  if (!admin) return res.status(401).json({ message: 'Accès interdit' })

  const demoTopics = ['Les meilleures consoles portables en 2025', 'L’IA dans les jeux vidéo', 'Pourquoi les accessoires gaming explosent']
  const results = []

  try {
    for (const topic of demoTopics) {
      const content = await generateBlogPost(topic)
      const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
      const blogPost = new Blog({
        title: topic,
        slug,
        content,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await blogPost.save()
      results.push(blogPost)
    }

    return res.status(200).json({ success: true, posts: results })
  } catch (err) {
    console.error('Erreur génération démo :', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
