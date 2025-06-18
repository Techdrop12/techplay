import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
