// ✅ /src/pages/api/reviews/index.js (liste, ajout, gestion des avis produits)
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/reviewModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { productId } = req.query;
    try {
      const reviews = await Review.find(productId ? { productId } : {}).sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST') {
    const { productId, author, rating, comment } = req.body;
    if (!productId || !author || !rating) {
      return res.status(400).json({ error: 'Missing params' });
    }
    try {
      const review = await Review.create({
        productId,
        author,
        rating,
        comment,
        createdAt: new Date()
      });
      res.status(201).json(review);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
