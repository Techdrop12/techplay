import { NextResponse } from 'next/server'

import { error as logError } from '@/lib/logger'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 })

  try {
    await dbConnect()
    const doc = await Blog.findById(id).exec()
    if (!doc) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })

    doc.published = !doc.published
    if (doc.published && !doc.publishedAt) doc.publishedAt = new Date()
    await doc.save()

    return NextResponse.json({ ok: true, published: doc.published })
  } catch (e) {
    logError('[blog/toggle-publish]', e)
    return NextResponse.json(
      { error: 'Erreur mise à jour' },
      { status: 500 }
    )
  }
}
