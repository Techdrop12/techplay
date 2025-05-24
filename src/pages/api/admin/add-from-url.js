import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ message: 'Lien manquant' })
  }

  try {
    await dbConnect()

    const response = await fetch(url)
    const data = await response.json()

    if (!data.title || !data.price) {
      return res.status(400).json({ message: 'Données produit incomplètes' })
    }

    const product = await Product.create({
      title: data.title,
      description: data.description || '',
      price: data.price,
      stock: data.stock || 100,
      category: data.category || 'Divers',
      image: data.image || '',
    })

    return res.status(201).json({ message: 'Produit importé', product })
  } catch (error) {
    console.error('Erreur import URL produit :', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
