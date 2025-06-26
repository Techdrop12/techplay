// ✅ src/pages/api/ai/generate-summary.js

import { generateProductSummary } from '@/lib/ai-tools';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { title, desc } = req.query;
  if (!title || !desc) return res.status(400).json({ error: 'Paramètres manquants' });

  const summary = await generateProductSummary({ title, description: desc });
  res.status(200).json({ summary });
}
