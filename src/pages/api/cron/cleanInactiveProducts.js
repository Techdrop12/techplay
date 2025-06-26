// ✅ src/pages/api/cron/cleanInactiveProducts.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const removed = await Product.deleteMany({ isActive: false });
  res.status(200).json({ removed: removed.deletedCount });
}
