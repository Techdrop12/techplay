import { connectToDatabase } from '@/lib/mongo'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await connectToDatabase()

  if (req.method === 'GET') {
    try {
      const products = await Product.find({})
      return res.status(200).json(products)
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits' })
    }
  }

  if (req.method === 'POST') {
    try {
      const product = await Product.create(req.body)
      return res.status(201).json(product)
    } catch (error) {
      return res.status(400).json({ error: 'Erreur lors de la création du produit', details: error.message })
    }
  }

  // Méthode non autorisée
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Méthode ${req.method} non autorisée`)
}
