import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { generateBlogPost } from '@/lib/ai-blog'
import { fetchUnsplashImage } from '@/lib/image-generator'
import { translateToEnglish } from '@/lib/translate'
import slugify from 'slugify'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { topic } = req.body
  if (!topic) return res.status(400).json({ error: 'Sujet manquant' })

  await dbConnect()

  try {
    const frContent = await generateBlogPost(topic)
    const enContent = await translateToEnglish(frContent)
    const image = await fetchUnsplashImage(topic)
    const slug = slugify(topic, { lower: true })

    const post = await Blog.create({
      title: topic,
      slug,
      content: frContent,
      en: enContent,
      image,
      published: true
    })

    res.status(200).json({ success: true, post })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la publication automatique' })
  }
}
