// ✅ src/pages/api/ai/chat.js

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const conversation = [
    ...(history || []),
    { role: 'user', content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: 'Assistant TechPlay' }, ...conversation],
    max_tokens: 256,
  });

  const reply = completion.choices[0]?.message.content?.trim() || 'Je n’ai pas compris, peux-tu reformuler ?';
  res.status(200).json({ reply });
}
