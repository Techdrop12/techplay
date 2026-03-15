import { NextResponse } from 'next/server'

import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db'
import Product from '@/models/Product'

const PRODUCT_FIELDS =
  '_id slug title description price oldPrice image images gallery rating reviewsCount stock category brand'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const idsParam = url.searchParams.get('ids')
  if (!idsParam?.trim()) {
    return NextResponse.json([])
  }
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50)
  const oids = ids
    .map((id) => {
      try {
        return new mongoose.Types.ObjectId(id)
      } catch {
        return null
      }
    })
    .filter(Boolean) as mongoose.Types.ObjectId[]
  if (oids.length === 0) return NextResponse.json([])

  try {
    await connectToDatabase()
    const docs = await Product.find({ _id: { $in: oids } })
      .select(PRODUCT_FIELDS)
      .lean()
      .exec()
    return NextResponse.json(JSON.parse(JSON.stringify(docs)))
  } catch (e) {
    console.error('[products/by-ids]', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
