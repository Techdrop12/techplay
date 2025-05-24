import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

export default async function handler(req, res) {
  const { id } = req.query
  await dbConnect()

  const order = await Order.findById(id)
  if (!order) return res.status(404).json({ error: 'Commande introuvable' })

  res.status(200).json(order)
}
