import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateArticle(topic) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Tu es un expert en high-tech et e-commerce.' },
      { role: 'user', content: `Écris un article SEO de blog sur : "${topic}" (300 mots, structuré en paragraphes, sans liste).` }
    ],
    temperature: 0.7,
  })

  return res.choices[0].message.content
}
