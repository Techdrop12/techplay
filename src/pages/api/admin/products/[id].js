// src/pages/api/admin/products/[id].js
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const updated = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ error: 'Produit introuvable' });
      return res.status(200).json(updated);
    } catch (err) {
      console.error('Erreur update produit:', err);
      return res.status(500).json({ error: 'Erreur interne serveur' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Produit introuvable' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Erreur suppression produit:', err);
      return res.status(500).json({ error: 'Erreur interne serveur' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
