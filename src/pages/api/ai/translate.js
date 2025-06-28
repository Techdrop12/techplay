// ✅ /src/pages/api/ai/translate.js (traduction AI multilingue, bonus)
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text, target } = req.body;
  if (!text || !target) return res.status(400).json({ error: 'Missing params' });

  try {
    const prompt = `Traduire ce texte en ${target} : "${text}"`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    });
    res.status(200).json({ translation: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
