import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  await dbConnect()
  if (req.method !== 'DELETE') return res.status(405).end()

  const admin = await isAdmin(req)
  if (!admin) return res.status(401).json({ message: 'Non autorisé' })

  const { id } = req.query
  await Blog.findByIdAndDelete(id)

  res.status(200).json({ success: true })
}
