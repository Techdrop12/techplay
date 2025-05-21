import { connectToDatabase } from '../../lib/mongo'
import Product from '@/models/Product'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Méthode ${req.method} non autorisée`)
  }

  try {
    await connectToDatabase()

    const products = await Product.find({})
    const categorySet = new Set(products.map((p) => p.category))

    const categories = [...categorySet].map((name) => ({
      _id: name,
      name,
    }))

    return res.status(200).json(categories)
  } catch (error) {
    console.error('Erreur dans /api/categories :', error)
    return res.status(500).json({ error: 'Erreur serveur lors du chargement des catégories' })
  }
}
