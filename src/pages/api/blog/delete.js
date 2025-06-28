// ✅ /src/pages/api/blog/delete.js (suppression article blog)
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID required' });
  try {
    await Blog.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
