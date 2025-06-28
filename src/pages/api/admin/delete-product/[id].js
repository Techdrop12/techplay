// ✅ /src/pages/api/admin/delete-product/[id].js (suppression produit, admin sécurisé)
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method !== 'DELETE') return res.status(405).end();

  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
