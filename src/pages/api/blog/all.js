// ✅ Fichier : src/pages/api/blog/all.js
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const blogs = await Blog.find().sort({ updatedAt: -1 });
      return res.status(200).json(blogs);
    } catch (error) {
      console.error('Erreur API blog/all:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
