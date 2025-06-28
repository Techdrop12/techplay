// ✅ /src/pages/api/categories/[category].js (récupérer une catégorie)
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export default async function handler(req, res) {
  await dbConnect();
  const { category } = req.query;

  if (req.method === 'GET') {
    const cat = await Category.findOne({ slug: category });
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(cat);
  } else {
    res.status(405).end();
  }
}
