// File: src/app/[locale]/admin/produit/[id]/page.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
