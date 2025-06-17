import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const {
        title,
        price,
        image,
        images = [],
        slug,
        description,
        category = 'Général',
        stock = 0,
        tags = [],
        isPromo = false,
        rating = 4.5,
      } = req.body;

      if (!title || !price || !image || !slug || !description) {
        return res.status(400).json({ error: 'Champs requis manquants' });
      }

      const exists = await Product.findOne({ slug });
      if (exists) {
        return res.status(400).json({ error: 'Slug déjà utilisé' });
      }

      const product = new Product({
        title,
        price: parseFloat(price),
        image,
        images,
        slug: slug.toLowerCase(),
        description,
        category,
        stock: parseInt(stock),
        tags,
        isPromo,
        rating,
        createdAt: new Date(),
      });

      await product.save();
      return res.status(201).json(product);
    } catch (err) {
      console.error('Erreur création produit:', err);
      return res.status(500).json({ error: 'Erreur interne serveur' });
    }
  }

  if (req.method === 'GET') {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
