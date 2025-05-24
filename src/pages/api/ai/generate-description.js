import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, specs } = req.body

  const prompt = `Écris une description marketing persuasive pour un produit appelé "${title}" avec les spécifications suivantes : ${specs}.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    res.status(200).json({ description: completion.choices[0].message.content })
  } catch (error) {
    console.error('Erreur IA:', error.message)
    res.status(500).json({ error: 'Erreur génération IA' })
  }
}
