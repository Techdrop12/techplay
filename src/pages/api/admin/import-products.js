// ✅ src/pages/api/admin/import-products.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  // Parse le fichier JSON
  const data = [];
  if (req.body && typeof req.body === 'object') {
    data.push(...req.body);
  } else if (req.files && req.files.file) {
    const content = req.files.file.data.toString('utf8');
    data.push(...JSON.parse(content));
  }
  if (!Array.isArray(data)) return res.status(400).json({ error: 'Format JSON invalide' });

  // Insertion en masse
  const inserted = await Product.insertMany(data, { ordered: false });
  res.status(200).json({ success: true, count: inserted.length });
}
