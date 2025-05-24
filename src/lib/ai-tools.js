import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateProductDescription(title, category) {
  const prompt = `Rédige une description persuasive pour un produit intitulé "${title}" dans la catégorie "${category}". Ton ton doit être vendeur et rassurant.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  return response.choices[0].message.content.trim()
}
