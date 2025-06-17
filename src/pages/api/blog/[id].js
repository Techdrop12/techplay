// ✅ src/pages/api/blog/[id].js
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import isAdmin from '@/lib/isAdmin';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'DELETE') {
    const admin = await isAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: 'Accès refusé' });
    }

    if (!id) {
      return res.status(400).json({ message: 'ID manquant' });
    }

    try {
      const deleted = await Blog.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erreur suppression article :', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
}
