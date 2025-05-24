import dbConnect from '@/lib/dbConnect'
import Review from '@/lib/models/reviewModel'

export default async function handler(req, res) {
  await dbConnect()

  const { productId } = req.query

  if (req.method === 'GET') {
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean()
    return res.status(200).json(reviews)
  }

  res.status(405).end()
}
