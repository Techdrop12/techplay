// ✅ /src/pages/api/admin/products/index.js (admin : ajout/listing produits)
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(products);
  } else if (req.method === 'POST') {
    const { title, price, description, image, category, stock } = req.body;
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required.' });
    }
    try {
      const product = await Product.create({
        title, price, description, image, category, stock
      });
      res.status(201).json(product);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
