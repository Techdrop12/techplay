import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import SitePage from '@/models/SitePage'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug?.trim()) return NextResponse.json({ error: 'Slug manquant' }, { status: 400 })

  try {
    await connectToDatabase()
    const doc = await SitePage.findOne({ slug: slug.trim().toLowerCase() }).lean().exec()
    if (!doc) return NextResponse.json(null)
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[site-pages/:slug]', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
