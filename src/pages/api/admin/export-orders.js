import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getOrders } from '@/lib/db/orders' // <-- adapte selon ta logique

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const orders = await getOrders() // récupère toutes les commandes

  const csv = [
    'ID,Date,Client,Email,Total (€),Articles',
    ...orders.map((order) => {
      const items = order.items.map(i => `${i.title} x${i.quantity}`).join(' | ')
      return `"${order._id}","${new Date(order.createdAt).toLocaleDateString()}","${order.customerName}","${order.email}",${order.total},"${items}"`
    })
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=commandes-techplay.csv')
  res.status(200).send(csv)
}
