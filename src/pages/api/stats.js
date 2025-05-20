import { connectToDatabase } from '@/lib/mongo'
import Product from '@/models/Product'

let FAKE_ORDERS = [
  { total: 29.99, date: '2024-05-10' },
  { total: 49.99, date: '2024-05-12' },
  { total: 99.00, date: '2024-05-17' },
]

export default async function handler(req, res) {
  await connectToDatabase()

  const totalSales = FAKE_ORDERS.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = FAKE_ORDERS.length
  const latestOrder = FAKE_ORDERS[FAKE_ORDERS.length - 1]?.date || null

  return res.status(200).json({ totalSales, totalOrders, latestOrder })
}
