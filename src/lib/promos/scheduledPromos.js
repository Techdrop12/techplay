// ✅ /src/lib/promos/scheduledPromos.js (gestion promos planifiées, bonus e-commerce)
import dbConnect from '../dbConnect';
import Product from '../../models/Product';

export async function applyScheduledPromos() {
  await dbConnect();
  const now = new Date();
  const promos = await Product.updateMany(
    { 'promo.endDate': { $lte: now } },
    { $unset: { promo: '' } }
  );
  return promos.modifiedCount;
}
