import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Review from '@/models/Review'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET() {
  const err = await requireAdmin()
  if (err) return err

  try {
    await connectToDatabase()
    const docs = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .lean()
      .exec()

    const list = docs.map((d) => ({
      _id: d._id,
      name: (d.user as { name?: string } | undefined)?.name ?? '—',
      rating: d.rating,
      comment: d.comment ?? '',
      productId: d.product?.toString?.() ?? d.product,
      createdAt: d.createdAt,
    }))

    return NextResponse.json(toPlain(list))
  } catch (e) {
    console.error('[reviews] GET', e)
    return NextResponse.json(
      { error: 'Erreur chargement avis' },
      { status: 500 }
    )
  }
}
