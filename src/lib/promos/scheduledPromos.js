// src/lib/promos/scheduledPromos.js
import dbConnect from '../dbConnect';
import Product from '../../models/Product';

/**
 * Convention: champ product.promo = { startDate, endDate, percent?, price? }
 * - Active la promo si startDate <= now
 * - Désactive si endDate <= now
 * - Alimente product.salePrice si défini
 */
export default async function applyScheduledPromos(now = new Date()) {
  await dbConnect();

  // Désactivation
  const endRes = await Product.updateMany(
    { 'promo.endDate': { $lte: now } },
    { $unset: { promo: '' }, $unset: { salePrice: '' } }
  );

  // Activation (création du salePrice selon percent/price)
  const toStart = await Product.find({
    'promo.startDate': { $lte: now },
    'promo.endDate': { $gt: now },
  })
    .select('_id price promo')
    .lean();

  let activated = 0;
  for (const p of toStart) {
    let salePrice = p.price;
    if (p.promo?.price) salePrice = Math.min(p.price, p.promo.price);
    else if (p.promo?.percent) salePrice = Math.max(0, Math.round(p.price * (1 - p.promo.percent / 100)));

    await Product.updateOne({ _id: p._id }, { $set: { salePrice } });
    activated++;
  }

  return { deactivated: endRes.modifiedCount ?? endRes.nModified, activated };
}
