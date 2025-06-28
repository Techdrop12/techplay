// ✅ /src/pages/api/ai/chat.js (assistant IA, version améliorée, prompt contextuel)
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'Messages required' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 200,
      temperature: 0.7
    });
    res.status(200).json(completion.choices[0].message);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
