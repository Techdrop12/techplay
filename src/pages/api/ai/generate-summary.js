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

  try {
    const { description } = req.body
    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    const prompt = `Fais un résumé vendeur en 2 phrases pour ce produit tech :\n\n${description}`

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 60,
      temperature: 0.7,
    })

    const summary = completion.data.choices[0].text.trim()
    res.status(200).json({ summary })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur OpenAI' })
  }
}
