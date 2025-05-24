
export async function cleanInactiveProducts() {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 6)

  const result = await db.collection('products').deleteMany({
    lastViewedAt: { $lt: cutoff },
    stock: { $eq: 0 }
  })

  return result.deletedCount
}