import { NextResponse } from 'next/server'

import { error as logError } from '@/lib/logger'
import { connectToDatabase } from '@/lib/db'
import Review from '@/models/Review'
import { requireAdmin } from '@/lib/requireAdmin'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  try {
    await connectToDatabase()
    const doc = await Review.findByIdAndDelete(id).exec()
    if (!doc) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    logError('[reviews/:id] DELETE', e)
    return NextResponse.json(
      { error: 'Erreur suppression' },
      { status: 500 }
    )
  }
}
