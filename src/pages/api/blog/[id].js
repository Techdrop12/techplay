import dbConnect from '@/lib/dbConnect'
import Article from '@/models/Article'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  await connectDB()
  const { id } = req.query

  if (req.method === 'DELETE') {
    await Article.deleteOne({ _id: new ObjectId(id) })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
