// ✅ /src/pages/api/reviews/[id].js (suppression/édition d’un avis)
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/reviewModel';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await Review.findByIdAndDelete(id);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'PUT') {
    const { rating, comment } = req.body;
    try {
      const review = await Review.findByIdAndUpdate(
        id,
        { rating, comment },
        { new: true }
      );
      res.status(200).json(review);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
