// ✅ src/pages/api/admin/orders.js

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token?.isAdmin) return res.status(401).json({ error: 'Admin only' });

  await dbConnect();

  if (req.method === 'GET') {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(orders);
  }

  if (req.method === 'PUT') {
    const { id, status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return res.status(200).json(order);
  }

  res.status(405).end();
}
