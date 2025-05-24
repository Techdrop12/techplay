import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  const { q } = req.query
  if (!q || q.length < 2) return res.status(200).json([])

  await dbConnect()

  const results = await Product.find({
    title: { $regex: q, $options: 'i' }
  }).limit(10)

  res.status(200).json(results.map(p => ({
    _id: p._id,
    title: p.title,
    slug: p.slug,
    price: p.price
  })))
}
