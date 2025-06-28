// ✅ /src/lib/ai-blog.js (IA rédaction d’articles)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBlogPost(topic, locale = 'fr') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `Tu es un rédacteur SEO e-commerce ${locale === 'fr' ? 'français' : 'anglais'}, concis et pertinent.` },
      { role: 'user', content: `Rédige un article de blog sur le sujet suivant (300 mots max) : ${topic}` }
    ],
    max_tokens: 600,
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
}
