import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { message } = req.body

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message requis' })
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un assistant de vente professionnel pour une boutique e-commerce tech premium. Tu réponds de manière concise, rassurante, utile et orientée conversion.',
        },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const reply = completion.data.choices[0].message.content
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('Erreur OpenAI:', err)
    return res.status(500).json({ error: 'Erreur serveur IA' })
  }
}
