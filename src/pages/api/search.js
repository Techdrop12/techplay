// ✅ /src/pages/api/search.js (recherche intelligente Fuse.js côté serveur)
import Fuse from 'fuse.js';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const products = await Product.find().lean();
    const fuse = new Fuse(products, {
      keys: ['title', 'description', 'category'],
      threshold: 0.3
    });
    const results = fuse.search(q).map(r => r.item);
    res.status(200).json(results.slice(0, 15));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
