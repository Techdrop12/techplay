import dbConnect from '../../../lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()
  const products = await Product.find({})
  res.status(200).json(products)
}
