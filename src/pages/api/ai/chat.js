import { Configuration, OpenAIApi } from 'openai';
import { z } from 'zod';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const schema = z.object({
  question: z.string().min(3),
  context: z.string().optional(),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { question, context } = schema.parse(req.body);

    const prompt = context
      ? `Produit : ${context}\n\nQuestion du client : ${question}`
      : question;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un conseiller expert pour une boutique e-commerce de produits tech. Tu expliques de manière simple, honnête, persuasive et rassurante, comme un très bon vendeur en boutique.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Erreur OpenAI:', err);
    return res.status(500).json({ error: 'Erreur serveur IA' });
  }
}
