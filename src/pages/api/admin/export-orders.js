// ✅ src/pages/api/admin/export-orders.js

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token?.isAdmin) return res.status(401).json({ error: 'Admin only' });

  await dbConnect();

  const orders = await Order.find({}).lean();
  let csv = 'ID,Email,Total,Status,CreatedAt\n';
  orders.forEach(o => {
    csv += `${o._id},${o.email},${o.total},${o.status},${o.createdAt}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.status(200).send(csv);
}
