import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import isAdmin from '@/lib/isAdmin'
import supplierData from '@/data/supplier-stock.json' // ici tu peux changer pour un fichier fusionné multi fournisseurs

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Méthode non autorisée')
  }

  await dbConnect()

  const admin = await isAdmin(req)
  if (!admin) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  let updatedCount = 0

  for (const item of supplierData) {
    const result = await Product.findOneAndUpdate(
      { slug: item.slug },
      {
        stock: item.stock,
        price: item.price,
      }
    )
    if (result) updatedCount++
  }

  return res.status(200).json({ success: true, updated: updatedCount })
}
