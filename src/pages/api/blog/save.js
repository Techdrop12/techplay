// ✅ src/pages/api/blog/save.js
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import isAdmin from '@/lib/isAdmin';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function translateToEnglish(frenchHtml) {
  const prompt = `
Tu es un traducteur professionnel. Traduis le contenu HTML suivant en anglais, en gardant les balises HTML intactes. Ne modifie pas la structure.

Contenu :
${frenchHtml}
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 1500
  });

  return res.choices?.[0]?.message?.content?.trim() || '';
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const admin = await isAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  const { title, content, image, publishAt } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Champs manquants' });
  }

  try {
    const slug = slugify(title);
    let blogPost = await Blog.findOne({ slug });

    const translated = await translateToEnglish(content);
    const publishDate = publishAt ? new Date(publishAt) : new Date();

    if (blogPost) {
      blogPost.title = title.trim();
      blogPost.content = content.trim();
      blogPost.en = translated;
      blogPost.image = image;
      blogPost.publishAt = publishDate;
      blogPost.published = false;
      blogPost.updatedAt = new Date();
    } else {
      blogPost = new Blog({
        title: title.trim(),
        slug,
        content: content.trim(),
        en: translated,
        image,
        published: false,
        publishAt: publishDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await blogPost.save();
    return res.status(200).json({ success: true, post: blogPost });
  } catch (error) {
    console.error('Erreur sauvegarde blog:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
