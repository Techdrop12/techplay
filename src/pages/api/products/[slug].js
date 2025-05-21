import dbConnect from '../../../lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  const { slug } = req.query
  await dbConnect()

  const product = await Product.findOne({ slug })
  if (!product) return res.status(404).json({ message: 'Produit introuvable' })

  res.status(200).json(product)
}
