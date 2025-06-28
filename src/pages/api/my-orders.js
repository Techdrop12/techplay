// ✅ /src/pages/api/my-orders.js (liste commandes pour profil utilisateur)
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  await dbConnect();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const orders = await Order.find({
      $or: [
        { 'user.email': email },
        { email }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
