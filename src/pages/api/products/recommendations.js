import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method !== 'GET') return res.status(405).end()

  const { category, excludeIds = '', limit = 4 } = req.query

  if (!category) {
    return res.status(400).json({ error: 'Catégorie manquante' })
  }

  try {
    const excludeArray = excludeIds.split(',').filter(Boolean)

    const products = await Product.find({
      category,
      _id: { $nin: excludeArray },
    })
      .limit(Number(limit))
      .lean()

    return res.status(200).json(products)
  } catch (error) {
    console.error('Erreur recommandations produits :', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
