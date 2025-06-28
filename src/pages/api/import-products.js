// ✅ /src/pages/api/import-products.js (import produits depuis un JSON ou API)
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Products array is required.' });
    }
    const result = await Product.insertMany(products, { ordered: false });
    res.status(200).json({ inserted: result.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
