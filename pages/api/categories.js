
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await connectToDatabase()
  if (req.method === 'GET') {
    const categories = await Product.distinct('category')
    return res.status(200).json(categories)
  }
  res.status(405).end()
}
