// ✅ /src/pages/api/blog/generate-demo.js (génération d’articles de blog IA, démo)
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { topic = 'high-tech' } = req.body;

  try {
    const prompt = `Génère un article de blog sur le sujet : ${topic}. Inclue titre, intro, 3 paragraphes courts, et une conclusion.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600
    });
    res.status(200).json({ article: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
