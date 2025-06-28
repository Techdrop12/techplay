// ✅ /src/pages/api/user/orders/[id].js (détail d’une commande utilisateur)
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Order ID required' });
  try {
    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
