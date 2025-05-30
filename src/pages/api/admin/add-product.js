import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const { title, price, image, slug, category, description } = req.body

    if (!title || !price || !image || !slug || !description) {
      return res.status(400).json({ error: 'Champs requis manquants' })
    }

    const existing = await Product.findOne({ slug })
    if (existing) {
      return res.status(409).json({ error: 'Slug déjà utilisé' })
    }

    const product = await Product.create({
      title,
      price,
      image,
      slug,
      category,
      description,
    })

    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
