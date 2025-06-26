// ✅ src/pages/api/admin/products/index.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token?.isAdmin) return res.status(401).json({ error: 'Admin only' });

  await dbConnect();

  if (req.method === 'GET') {
    const products = await Product.find({}).lean();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    try {
      const product = await Product.create(req.body);
      return res.status(201).json(product);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(405).end();
}
