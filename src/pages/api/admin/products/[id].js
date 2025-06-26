// ✅ src/pages/api/admin/products/[id].js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token?.isAdmin) return res.status(401).json({ error: 'Admin only' });

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true }).lean();
    return res.status(200).json(product);
  }

  if (req.method === 'DELETE') {
    await Product.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.status(405).end();
}
