// src/pages/api/reviews/[id].js 
import dbConnect from '@/lib/dbConnect'
import Review from '@/lib/models/reviewModel'

export default async function handler(req, res) {
  await dbConnect()
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      const deleted = await Review.findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ message: 'Avis introuvable' })
      return res.status(200).json({ message: 'Avis supprimé' })
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur', error })
    }
  }

  res.setHeader('Allow', ['DELETE'])
  res.status(405).end(`Méthode ${req.method} non autorisée`)
}
