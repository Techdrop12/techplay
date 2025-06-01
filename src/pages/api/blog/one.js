import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'

export default async function handler(req, res) {
  await dbConnect()

  const { slug } = req.query

  if (req.method === 'GET') {
    if (!slug) return res.status(400).json({ message: 'Slug manquant' })

    try {
      const blog = await Blog.findOne({ slug })
      if (!blog) return res.status(404).json({ message: 'Article non trouvé' })
      return res.status(200).json(blog)
    } catch (err) {
      console.error('Erreur API blog/one:', err)
      return res.status(500).json({ message: 'Erreur serveur' })
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' })
}
