import dbConnect from '@/lib/db'
import Order from '@/models/Order'

export default async function handler(req, res) {
  await dbConnect()
  const orders = await Order.find({}).sort({ createdAt: -1 })
  res.status(200).json(orders)
}
