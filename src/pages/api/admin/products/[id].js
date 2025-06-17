import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import isAdmin from '@/lib/isAdmin';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (!(await isAdmin(req))) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedProduct) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(updatedProduct);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
