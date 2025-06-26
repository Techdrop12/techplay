// ✅ src/pages/api/products/[slug].js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { slug } = req.query;

  if (req.method === 'GET') {
    const product = await Product.findOne({ slug }).lean();
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    return res.status(200).json(product);
  }

  res.status(405).end();
}
