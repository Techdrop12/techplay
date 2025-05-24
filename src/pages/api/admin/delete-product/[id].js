import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  await dbConnect()
  const { id } = req.query

  const admin = await isAdmin(req)
  if (!admin) {
    return res.status(401).json({ error: 'Accès non autorisé' })
  }

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id)
      if (!product) return res.status(404).json({ error: 'Produit introuvable' })
      return res.status(200).json(product)
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  if (req.method === 'PUT') {
    const { title, price, description, image, slug } = req.body
    try {
      await Product.findByIdAndUpdate(id, { title, price, description, image, slug })
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Erreur mise à jour' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Product.findByIdAndDelete(id)
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Erreur suppression produit' })
    }
  }

  return res.status(405).end()
}
