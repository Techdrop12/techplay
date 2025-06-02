import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  await dbConnect()
  if (req.method !== 'POST') return res.status(405).end()

  const admin = await isAdmin(req)
  if (!admin) return res.status(401).json({ message: 'Non autorisé' })

  const { id } = req.query
  const post = await Blog.findById(id)
  if (!post) return res.status(404).json({ message: 'Introuvable' })

  post.published = !post.published
  post.updatedAt = new Date()
  await post.save()

  res.status(200).json({ success: true, post })
}
