import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

export default async function handler(req, res) {
  await dbConnect()
  const token = await getToken({ req })

  if (!token?.email) {
    return res.status(401).json({ error: 'Non connecté' })
  }

  const orders = await Order.find({ email: token.email }).sort({ createdAt: -1 })

  res.status(200).json(orders)
}
