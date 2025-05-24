import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  const { slug } = req.query
  await dbConnect()

  if (req.method === 'POST') {
    const { name, rating, comment } = req.body

    if (
      !name?.trim() ||
      !comment?.trim() ||
      typeof rating !== 'number' ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({ error: 'Champs invalides' })
    }

    const product = await Product.findOne({ slug })
    if (!product) return res.status(404).json({ error: 'Produit introuvable' })

    product.reviews = product.reviews || []
    product.reviews.push({
      name: name.trim().substring(0, 50),
      rating,
      comment: comment.trim().substring(0, 300),
      date: new Date(),
    })
    await product.save()

    return res.status(200).json({ success: true })
  }

  if (req.method === 'GET') {
    const product = await Product.findOne({ slug })
    if (!product) return res.status(404).json({ error: 'Produit introuvable' })
    return res.status(200).json(product.reviews || [])
  }

  res.status(405).end()
}

