// src/lib/ai-blog.js
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Récupère une image aléatoire depuis Unsplash en lien avec le sujet.
 */
async function fetchUnsplashImage(query) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    )
    const data = await res.json()
    return data?.urls?.regular || null
  } catch (err) {
    console.error('Erreur Unsplash:', err)
    return null
  }
}

/**
 * Génère un article HTML structuré (titre <h1>, intro, paragraphes, conclusion).
 * Retourne { title, html, image }
 */
export async function generateBlogPost(topic) {
  if (!topic || typeof topic !== 'string') {
    throw new Error('Sujet invalide')
  }

  const prompt = `
Rédige un article de blog professionnel en français, optimisé SEO, sur le sujet : "${topic}".
Le contenu doit inclure :
- Un titre principal dans une balise <h1>
- Une introduction courte (<p>)
- Trois paragraphes argumentés (<h2> et <p>)
- Une conclusion engageante (<p>)
- Format HTML complet uniquement, sans balises inutiles

Structure claire, fluide et informative.
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1200
  })

  const html = response.choices[0].message.content.trim()

  // Extraction du titre depuis <h1>
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  const title = titleMatch ? titleMatch[1] : topic

  // Image illustrative via Unsplash
  const image = await fetchUnsplashImage(topic)

  return {
    title,
    html,
    image
  }
}
