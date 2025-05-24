import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import isAdmin from '@/lib/isAdmin'
import supplierData from '@/data/supplier-stock.json'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const admin = await isAdmin(req)
  if (!admin) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  let updated = 0

  try {
    for (const item of supplierData) {
      if (typeof item.stock !== 'number' || typeof item.price !== 'number') {
        continue // Ignorer données invalides
      }

      await Product.findOneAndUpdate(
        { slug: item.slug },
        {
          stock: item.stock,
          price: item.price,
        },
        { upsert: true }
      )
      updated++
    }

    res.status(200).json({ success: true, updated })
  } catch (error) {
    console.error('Erreur sync-stock:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
