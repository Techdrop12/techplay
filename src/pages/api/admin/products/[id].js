// ✅ /src/pages/api/admin/products/[id].js (admin : édition, suppression produit)
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(product);
  } else if (req.method === 'PUT') {
    const { title, price, description, image, category, stock } = req.body;
    try {
      const updated = await Product.findByIdAndUpdate(
        id,
        { title, price, description, image, category, stock },
        { new: true }
      );
      res.status(200).json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await Product.findByIdAndDelete(id);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
