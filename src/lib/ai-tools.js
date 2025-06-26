// ✅ src/lib/ai-tools.js

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateProductSummary(product) {
  const prompt = `Résumé en 1 phrase ce produit pour un e-commerce : ${product.title}, ${product.description}`;
  const { choices } = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt,
    max_tokens: 48,
  });
  return choices[0]?.text.trim() || '';
}

export async function generateBlogIdeas(topic) {
  const prompt = `Donne-moi 5 idées d'articles de blog sur le sujet suivant : "${topic}" pour un site de tech high-ticket.`;
  const { choices } = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt,
    max_tokens: 128,
  });
  return choices[0]?.text.split('\n').filter(Boolean);
}
