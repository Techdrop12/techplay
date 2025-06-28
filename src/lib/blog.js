// ✅ /src/lib/blog.js (gestion articles, bonus : recherche, filtrage)
import dbConnect from './dbConnect';
import Blog from '@/models/Blog';

export async function getAllPosts({ publishedOnly = true, limit = 30 } = {}) {
  await dbConnect();
  const query = publishedOnly ? { published: true } : {};
  return Blog.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function getPostBySlug(slug) {
  await dbConnect();
  return Blog.findOne({ slug }).lean();
}

export async function searchPosts(keyword) {
  await dbConnect();
  return Blog.find({
    $text: { $search: keyword }
  }).lean();
}
