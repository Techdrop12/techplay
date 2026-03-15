import { NextResponse } from 'next/server'

import { error as logError } from '@/lib/logger'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

export async function DELETE(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 })

  try {
    await dbConnect()
    const doc = await Blog.findByIdAndDelete(id).exec()
    if (!doc) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    logError('[blog/delete]', e)
    return NextResponse.json(
      { error: 'Erreur suppression' },
      { status: 500 }
    )
  }
}
