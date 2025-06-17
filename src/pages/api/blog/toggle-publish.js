// ✅ src/pages/api/blog/toggle-publish.js
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import isAdmin from '@/lib/isAdmin';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const admin = await isAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: 'Accès refusé' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'ID manquant' });
  }

  try {
    const post = await Blog.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Article introuvable' });
    }

    post.published = !post.published;
    post.updatedAt = new Date();
    await post.save();

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Erreur toggle publish blog :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
