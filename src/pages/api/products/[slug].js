import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { slug } = req.query;

  try {
    const product = await Product.findOne({ slug })
      .populate('relatedProducts')
      .populate('alsoBought');

    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    res.status(200).json(product);
  } catch (err) {
    console.error('Erreur serveur produit:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
