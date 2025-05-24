import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const admin = await isAdmin(req)
  if (!admin) {
    return res.status(401).json({ message: 'Accès non autorisé' })
  }

  const { title, content } = req.body

  if (!title || !content) {
    return res.status(400).json({ message: 'Champs manquants' })
  }

  try {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
    let blogPost = await Blog.findOne({ slug })

    if (blogPost) {
      blogPost.title = title.trim()
      blogPost.content = content.trim()
      blogPost.updatedAt = new Date()
    } else {
      blogPost = new Blog({
        title: title.trim(),
        slug,
        content: content.trim(),
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await blogPost.save()
    res.status(200).json({ success: true, post: blogPost })
  } catch (error) {
    console.error('Erreur sauvegarde blog:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
