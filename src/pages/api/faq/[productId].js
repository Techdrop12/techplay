// ✅ src/pages/api/faq/[productId].js

import dbConnect from '@/lib/dbConnect';
import FAQ from '@/models/FAQ';

export default async function handler(req, res) {
  await dbConnect();
  const { productId } = req.query;
  if (req.method === 'GET') {
    const faqs = await FAQ.find({ productId });
    return res.status(200).json(faqs);
  }
  if (req.method === 'POST') {
    const { question, answer } = req.body;
    const faq = await FAQ.create({ productId, question, answer });
    return res.status(201).json(faq);
  }
  res.status(405).end();
}
