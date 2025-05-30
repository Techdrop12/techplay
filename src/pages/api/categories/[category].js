import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()
  const { category } = req.query

  try {
    const products = await Product.find({ category })
    res.status(200).json(products)
  } catch (error) {
    console.error('Erreur chargement produits par catégorie :', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
