// ✅ /src/pages/api/blog/all.js (liste articles blog, admin)
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();
  const posts = await Blog.find().sort({ createdAt: -1 }).lean();
  res.status(200).json(posts);
}
