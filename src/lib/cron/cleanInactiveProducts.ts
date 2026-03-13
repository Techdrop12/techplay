import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export interface CleanOptions {
  months?: number
  onlyOutOfStock?: boolean
  mode?: 'soft' | 'hard'
  dryRun?: boolean
  batchSize?: number
}

export interface CleanResult {
  matched: number
  modified: number
  mode: string
}

export async function cleanInactiveProducts(opts: CleanOptions = {}): Promise<CleanResult> {
  const {
    months = 6,
    onlyOutOfStock = true,
    mode = (process.env.PRODUCT_CLEAN_MODE as 'soft' | 'hard') || 'soft',
    dryRun = false,
    batchSize = 500,
  } = opts

  await dbConnect()

  const threshold = new Date()
  threshold.setMonth(threshold.getMonth() - months)

  const query: Record<string, unknown> = { lastSoldAt: { $lte: threshold } }
  if (onlyOutOfStock) (query as Record<string, unknown>).stock = { $lte: 0 }

  if (dryRun) {
    const matched = await Product.countDocuments(query)
    return { matched, modified: 0, mode: 'dry-run' }
  }

  if (mode !== 'hard') {
    const res = await Product.updateMany(
      query,
      { $set: { archived: true, archivedAt: new Date() } },
      { strict: false }
    )
    const matched = res.matchedCount ?? (res as { n?: number }).n ?? 0
    const modified = res.modifiedCount ?? (res as { nModified?: number }).nModified ?? 0
    return { matched, modified, mode: 'soft' }
  }

  let matched = 0
  let modified = 0
  const cursor = Product.find(query).select('_id').cursor()
  const ids: unknown[] = []

  for await (const doc of cursor) {
    ids.push((doc as { _id: unknown })._id)
    if (ids.length >= batchSize) {
      const r = await Product.deleteMany({ _id: { $in: ids } })
      matched += ids.length
      modified += r.deletedCount ?? 0
      ids.length = 0
    }
  }
  if (ids.length > 0) {
    const r = await Product.deleteMany({ _id: { $in: ids } })
    matched += ids.length
    modified += r.deletedCount ?? 0
  }
  return { matched, modified, mode: 'hard' }
}

export default cleanInactiveProducts
