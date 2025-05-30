import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'GET') {
    const categories = await Category.find().sort({ name: 1 }).select('name')
    const names = categories.map(c => c.name)
    return res.status(200).json(names)
  }

  if (req.method === 'POST') {
    const { name, slug } = req.body
    try {
      const category = new Category({ name, slug })
      await category.save()
      return res.status(201).json(category)
    } catch (err) {
      return res.status(500).json({ error: 'Erreur création catégorie' })
    }
  }

  return res.status(405).end()
}
