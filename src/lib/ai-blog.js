import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateBlogPost(topic) {
  const prompt = `
    Rédige un article de blog professionnel en français, optimisé SEO, sur le sujet : "${topic}".
    L'article doit contenir :
    - Un titre accrocheur
    - Une introduction courte
    - 3 paragraphes de fond
    - Une conclusion avec appel à l'action
  `

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 800,
  })

  return res.choices[0].message.content.trim()
}
