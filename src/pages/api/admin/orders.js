import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'GET') {
    const orders = await Order.find().sort({ createdAt: -1 })
    return res.status(200).json(orders)
  }

  if (req.method === 'PUT') {
    const { id, status } = req.body
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ error: 'Commande introuvable' })

    order.status = status
    await order.save()
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  res.status(405).end(`Méthode ${req.method} non autorisée`)
}
