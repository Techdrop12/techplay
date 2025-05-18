
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await connectToDatabase()

  if (req.method === 'GET') {
    const products = await Product.find()
    return res.status(200).json(products)
  }

  if (req.method === 'POST') {
    const { title, description, price, category, image } = req.body
    const product = new Product({ title, description, price, category, image })
    await product.save()
    return res.status(201).json(product)
  }

  res.status(405).end()
}
