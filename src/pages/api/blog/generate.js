import { generateBlogPost } from '@/lib/ai-blog'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { topic } = req.body
  if (!topic) return res.status(400).json({ error: 'Sujet manquant' })

  try {
    const content = await generateBlogPost(topic)
    res.status(200).json({ content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur IA' })
  }
}
