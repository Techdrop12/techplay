import dbConnect from '../../../lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await dbConnect()

  const { title, price, description, image, slug } = req.body
  const newProduct = new Product({ title, price, description, image, slug })

  await newProduct.save()
  res.status(200).json({ success: true })
}
