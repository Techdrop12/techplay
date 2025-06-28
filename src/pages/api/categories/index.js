// ✅ /src/pages/api/categories/index.js (liste des catégories)
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } else if (req.method === 'POST') {
    const { name, slug, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
      const category = await Category.create({ name, slug, description });
      res.status(201).json(category);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
