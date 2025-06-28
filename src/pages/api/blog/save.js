// ✅ /src/pages/api/blog/save.js (sauvegarder ou éditer un article)
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { title, content, slug, published } = req.body;
    if (!title || !content || !slug) return res.status(400).json({ error: 'Missing params' });
    try {
      let post = await Blog.findOneAndUpdate(
        { slug },
        { title, content, published, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      res.status(200).json(post);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
