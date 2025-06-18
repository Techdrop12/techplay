import dbConnect from '@/lib/dbConnect';
import Review from '@/lib/models/reviewModel';
import { z } from 'zod';

const schema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2).max(50),
  comment: z.string().min(3).max(500),
  rating: z.number().min(1).max(5),
});

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const reviews = await Review.find({}).sort({ createdAt: -1 });
      return res.status(200).json(reviews);
    } catch (err) {
      return res.status(500).json({ message: 'Erreur lors du chargement des avis.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { productId, name, comment, rating } = schema.parse(req.body);

      const review = await Review.create({
        productId,
        name,
        comment,
        rating,
        verified: true,
        createdAt: new Date(),
      });

      return res.status(201).json(review);
    } catch (err) {
      return res.status(400).json({ error: err.errors || 'Données invalides' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}
