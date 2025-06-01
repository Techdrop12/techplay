// src/lib/ai-blog.js
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Unsplash → image gratuite pour illustrer l'article
async function fetchUnsplashImage(query) {
  const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`)
  const data = await res.json()
  return data?.urls?.regular || null
}

export async function generateBlogPost(topic) {
  const prompt = `
Rédige un article de blog professionnel en français, optimisé SEO, sur le sujet : "${topic}".
Le contenu doit inclure :
- Un titre accrocheur
- Une introduction courte
- 3 paragraphes argumentés
- Une conclusion engageante
- Le tout formaté en HTML directement (titres, paragraphes)

Donne uniquement l'article complet formaté HTML.
`

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const html = res.choices[0].message.content.trim()

  // Extraction du <h1> pour titre
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  const title = titleMatch ? titleMatch[1] : topic

  // Image via Unsplash (optionnelle)
  const image = await fetchUnsplashImage(topic)

  return {
    title,
    html,
    image,
  }
}
