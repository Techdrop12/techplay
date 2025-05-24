import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function translateToEnglish(content) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `Traduis ce texte en anglais :\n\n${content}`
      }
    ],
    temperature: 0.3,
    max_tokens: 800
  })

  return res.choices[0].message.content.trim()
}
