// ✅ src/pages/api/blog/generate.js
import { generateBlogPost } from '@/lib/ai-blog';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { topic } = req.body;
  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Sujet manquant ou vide' });
  }

  try {
    const content = await generateBlogPost(topic.trim());
    return res.status(200).json({ content });
  } catch (error) {
    console.error('Erreur génération IA blog:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération AI' });
  }
}
