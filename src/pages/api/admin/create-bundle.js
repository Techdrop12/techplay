import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const admin = await isAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Non autorisé' })

  const { title, products, price, description, image, slug } = req.body

  if (!title || !products || !Array.isArray(products) || products.length === 0 || !price) {
    return res.status(400).json({ error: 'Champs manquants ou invalides' })
  }

  try {
    await dbConnect()

    // Créer un produit "bundle"
    const bundle = new Product({
      title,
      slug,
      description,
      image,
      price,
      isBundle: true,
      bundleItems: products, // tableau d’ids produits inclus dans le pack
      stock: Math.min(...products.map(p => p.stock)), // stock minimal parmi les produits du pack
    })

    await bundle.save()

    res.status(200).json({ success: true, bundle })
  } catch (error) {
    console.error('Erreur création bundle:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
