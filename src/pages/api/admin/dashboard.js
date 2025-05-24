import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

export default async function handler(req, res) {
  await dbConnect()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextWeek = new Date()
  nextWeek.setDate(now.getDate() + 7)

  const orders = await Order.find({ createdAt: { $gte: startOfMonth } }).sort({ createdAt: -1 })

  const caMonth = orders.reduce((sum, order) => sum + order.total, 0)

  const nextWeekOrders = orders.filter(order => order.createdAt < nextWeek)
  const caNextWeek = nextWeekOrders.reduce((sum, order) => sum + order.total, 0)
  const ordersNextWeek = nextWeekOrders.length

  res.status(200).json({
    caMonth,
    caNextWeek,
    ordersNextWeek
  })
}
