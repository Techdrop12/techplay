import OpenAI from 'openai'

import { error as logError } from './logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
})

export async function generateBlogPost(topic: string, locale = 'fr'): Promise<string> {
  if (!topic || typeof topic !== 'string') throw new Error('Sujet invalide')

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        locale === 'fr'
          ? 'Tu es un expert SEO e-commerce français. Rédige un article clair, engageant et optimisé.'
          : 'You are an English e-commerce SEO expert. Write a clear, engaging, optimized blog post.',
    },
    {
      role: 'user',
      content: `${
        locale === 'fr'
          ? 'Rédige un article de blog sur le sujet suivant (300 mots max) : '
          : 'Write a blog post about the following topic (max 300 words): '
      } ${topic}`,
    },
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 700,
      temperature: 0.7,
    })

    return completion.choices?.[0]?.message?.content?.trim() ?? ''
  } catch (err) {
    logError('Erreur génération article IA :', err)
    return locale === 'fr'
      ? "Désolé, une erreur est survenue lors de la génération de l'article."
      : 'Sorry, an error occurred while generating the blog post.'
  }
}
