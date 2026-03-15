import { NextResponse } from 'next/server'

import { error as logError } from '@/lib/logger'
import { connectToDatabase } from '@/lib/db'
import Review from '@/models/Review'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(5, Number(url.searchParams.get('limit')) || 20))
  const ratingParam = url.searchParams.get('rating')?.trim()
  const ratingNum = ratingParam != null && ratingParam !== '' ? Number(ratingParam) : NaN
  const ratingFilter = Number.isInteger(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : null
  const skip = (page - 1) * limit

  try {
    await connectToDatabase()
    const filter = ratingFilter != null ? { rating: ratingFilter } : {}
    const [docs, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Review.countDocuments(filter),
    ])

    const list = docs.map((d) => ({
      _id: d._id,
      name: (d.user as { name?: string } | undefined)?.name ?? '—',
      rating: d.rating,
      comment: d.comment ?? '',
      productId: d.product?.toString?.() ?? d.product,
      createdAt: d.createdAt,
    }))

    const pages = Math.max(1, Math.ceil(total / limit))
    return NextResponse.json(toPlain({ items: list, total, page, limit, pages }))
  } catch (e) {
    logError('[reviews] GET', e)
    return NextResponse.json(
      { error: 'Erreur chargement avis' },
      { status: 500 }
    )
  }
}
