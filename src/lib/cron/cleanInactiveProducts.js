// ✅ /src/lib/cron/cleanInactiveProducts.js (nettoyage automatique des produits inactifs)
import dbConnect from '../dbConnect';
import Product from '../../models/Product';

export async function cleanInactiveProducts() {
  await dbConnect();
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 6); // 6 mois sans vente
  const result = await Product.deleteMany({
    lastSoldAt: { $lte: threshold },
    stock: { $lte: 0 },
  });
  return result.deletedCount;
}
