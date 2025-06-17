import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import isAdmin from '@/lib/isAdmin';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query || req.params || {};

  if (!id) {
    return res.status(400).json({ error: 'ID produit manquant' });
  }

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(product);
    } catch (err) {
      console.error('Erreur récupération produit:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'PUT') {
    const authorized = await isAdmin(req);
    if (!authorized) return res.status(401).json({ error: 'Non autorisé' });

    try {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(updated);
    } catch (err) {
      console.error('Erreur mise à jour produit:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'DELETE') {
    const authorized = await isAdmin(req);
    if (!authorized) return res.status(401).json({ error: 'Non autorisé' });

    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Erreur suppression produit:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
