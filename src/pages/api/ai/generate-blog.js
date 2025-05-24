import dbConnect from '@/lib/dbConnect'
import { generateBlogPost } from '@/lib/ai-blog'
import Blog from '@/models/Blog'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { topic } = req.body
  if (!topic || topic.trim().length < 3) {
    return res.status(400).json({ message: 'Sujet invalide' })
  }

  try {
    await dbConnect()
    const content = await generateBlogPost(topic)

    const newPost = new Blog({
      title: topic,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newPost.save()

    res.status(200).json({ success: true, post: newPost })
  } catch (error) {
    console.error('Erreur génération blog:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
