// ✅ /src/pages/api/blog/toggle-publish.js (changer statut publication article)
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();
  const { id, published } = req.body;
  if (!id) return res.status(400).json({ error: 'ID required' });
  try {
    const post = await Blog.findByIdAndUpdate(id, { published }, { new: true });
    res.status(200).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
