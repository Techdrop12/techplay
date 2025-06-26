// ✅ src/pages/api/user/orders.js

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token?.email) return res.status(401).json({ error: 'Non autorisé' });

  await dbConnect();

  if (req.method === 'GET') {
    const orders = await Order.find({
      $or: [
        { 'user.email': token.email },
        { email: token.email }
      ]
    }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(orders);
  }

  res.status(405).end();
}
