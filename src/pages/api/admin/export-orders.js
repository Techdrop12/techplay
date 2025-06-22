import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getOrders } from '@/lib/db/orders';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const orders = await getOrders();

    const csv = [
      'ID,Date,Client,Email,Total (€),Articles',
      ...orders.map((order) => {
        const items = order.items.map(i => `${i.title} x${i.quantity}`).join(' | ');
        const date = new Date(order.createdAt).toLocaleDateString('fr-FR');
        return `"${order._id}","${date}","${order.customerName || ''}","${order.email}",${order.total},"${items}"`;
      })
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=commandes-techplay.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Erreur export commandes :', err);
    res.status(500).json({ error: 'Erreur export' });
  }
}
