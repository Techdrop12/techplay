import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  await dbConnect()

  const orders = await Order.find({ email: session.user.email }).sort({ createdAt: -1 })

  res.status(200).json(
    orders.map((order) => ({
      id: order._id,
      total: order.total,
      date: order.createdAt.toISOString().split('T')[0],
    }))
  )
}
