// ✅ /src/pages/api/chatbot.js (assistant IA public / API pour chatbot)
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    });
    const response = completion.data.choices[0].message.content;
    res.status(200).json({ response });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
