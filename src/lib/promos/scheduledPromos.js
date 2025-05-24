import db from '../db/mongo'

export async function applyScheduledPromos() {
  const now = new Date()
  const promos = await db.collection('promotions').find({
    start: { $lte: now },
    end: { $gte: now }
  }).toArray()

  for (const promo of promos) {
    await db.collection('products').updateMany(
      { category: promo.category },
      { $set: { price: promo.newPrice } }
    )
  }

  return promos.length
}