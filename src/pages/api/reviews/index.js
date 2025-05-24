import dbConnect from '@/lib/dbConnect'
import Review from '@/lib/models/reviewModel'
import { z } from 'zod'

const schema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2).max(50),
  comment: z.string().min(3).max(500),
  rating: z.number().min(1).max(5),
})

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'POST') {
    const body = req.body

    try {
      const { productId, name, comment, rating } = schema.parse(body)

      const review = await Review.create({
        productId,
        name,
        comment,
        rating,
        createdAt: new Date(),
      })

      return res.status(201).json(review)
    } catch (err) {
      return res.status(400).json({ error: err.errors || 'Données invalides' })
    }
  }

  res.status(405).end()
}
