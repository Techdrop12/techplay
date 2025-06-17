// ✅ src/pages/api/blog/delete.js
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import isAdmin from '@/lib/isAdmin';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'DELETE') {
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
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Article introuvable' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur suppression blog :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
