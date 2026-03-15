import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import SitePage from '@/models/SitePage'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')?.trim()

  try {
    await connectToDatabase()
    if (slug) {
      const doc = await SitePage.findOne({ slug }).lean().exec()
      if (!doc) return NextResponse.json({ error: 'Page introuvable' }, { status: 404 })
      return NextResponse.json(toPlain(doc))
    }
    const docs = await SitePage.find({}).sort({ slug: 1 }).lean().exec()
    return NextResponse.json(toPlain(docs))
  } catch (e) {
    console.error('[admin/site-pages]', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  let body: { slug: string; title: string; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }
  const slug = body?.slug?.trim()
  const title = body?.title?.trim()
  if (!slug || !title) return NextResponse.json({ error: 'slug et title requis' }, { status: 400 })

  try {
    await connectToDatabase()
    const doc = await SitePage.findOneAndUpdate(
      { slug },
      { $set: { title, content: body?.content ?? '' } },
      { new: true, upsert: true }
    )
      .lean()
      .exec()
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[admin/site-pages] PUT', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
