// ✅ /src/lib/ai-tools.js (bonus : outils IA divers, résumé, trad, idée de produit…)
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSummary(text, locale = 'fr') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `Résume ce texte en 3 phrases (${locale}).` },
      { role: 'user', content: text }
    ],
    max_tokens: 250,
    temperature: 0.5,
  });
  return completion.choices[0].message.content;
}

export async function suggestProductIdeas(theme, locale = 'fr') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `Génère des idées de produits e-commerce dans la thématique : ${theme} (${locale})` }
    ],
    max_tokens: 350,
    temperature: 0.8,
  });
  return completion.choices[0].message.content;
}
