import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import isAdmin from '@/lib/isAdmin'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method !== 'POST') {
    return res.status(405).end('Méthode non autorisée')
  }

  const admin = await isAdmin(req)
  if (!admin) {
    return res.status(401).json({ error: 'Accès interdit' })
  }

  const { title, price, description, image, slug } = req.body

  if (!title || !price || !description || !image || !slug) {
    return res.status(400).json({ error: 'Champs manquants ou invalides' })
  }

  try {
    const newProduct = new Product({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      image: image.trim(),
      price: parseFloat(price),
    })

    await newProduct.save()
    res.status(200).json({ success: true, product: newProduct })
  } catch (err) {
    console.error('Erreur création produit :', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
