// ✅ src/pages/api/products/recommendations.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const { category, excludeIds } = req.query;
  const exclude = (excludeIds || '').split(',').filter(Boolean);

  const products = await Product.find({
    category,
    _id: { $nin: exclude }
  }).limit(8).lean();

  res.status(200).json(products);
}

