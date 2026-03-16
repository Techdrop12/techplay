// src/lib/promos/scheduledPromos.ts
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function applyScheduledPromos(
  now: Date = new Date()
): Promise<{ deactivated: number; activated: number }> {
  await dbConnect();

  const endRes = await Product.updateMany(
    { 'promo.endDate': { $lte: now } },
    { $unset: { promo: '', salePrice: '' } }
  );

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
    else if ((p.promo as { percent?: number })?.percent)
      salePrice = Math.max(
        0,
        Math.round(p.price * (1 - (p.promo as { percent: number }).percent / 100))
      );

    await Product.updateOne({ _id: p._id }, { $set: { salePrice } });
    activated++;
  }

  return {
    deactivated: endRes.modifiedCount ?? (endRes as { nModified?: number }).nModified ?? 0,
    activated,
  };
}
