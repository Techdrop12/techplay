import dbConnect from '../../../lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()
  const { id } = req.query

  if (req.method === 'GET') {
    const product = await Product.findById(id)
    return res.status(200).json(product)
  }

  if (req.method === 'PUT') {
    const { title, price, description, image, slug } = req.body
    await Product.findByIdAndUpdate(id, { title, price, description, image, slug })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
