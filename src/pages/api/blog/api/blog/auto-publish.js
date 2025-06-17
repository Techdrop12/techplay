// ✅ src/pages/api/blog/auto-publish.js
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { generateBlogPost } from '@/lib/ai-blog';
import { fetchUnsplashImage } from '@/lib/image-generator';
import { translateToEnglish } from '@/lib/translate';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { topic } = req.body;
  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Sujet manquant' });
  }

  await dbConnect();

  try {
    const frContent = await generateBlogPost(topic);
    const enContent = await translateToEnglish(frContent);
    const image = await fetchUnsplashImage(topic);
    const slug = slugify(topic);

    const post = await Blog.create({
      title: topic.trim(),
      slug,
      content: frContent,
      en: enContent,
      image,
      published: true,
      publishAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(200).json({ success: true, post });
  } catch (err) {
    console.error('Erreur publication auto blog :', err);
    return res.status(500).json({ error: 'Erreur lors de la publication automatique' });
  }
}
