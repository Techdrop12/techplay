import { NextResponse } from 'next/server'

import { error as logError } from '@/lib/logger'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET() {
  const err = await requireAdmin()
  if (err) return err

  try {
    await dbConnect()
    const docs = await Blog.find({})
      .sort({ createdAt: -1 })
      .select('_id title slug published publishedAt createdAt')
      .lean()
      .exec()
    return NextResponse.json(toPlain(docs))
  } catch (e) {
    logError('[blog/all]', e)
    return NextResponse.json(
      { error: 'Erreur chargement articles' },
      { status: 500 }
    )
  }
}
