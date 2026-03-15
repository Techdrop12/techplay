import { NextResponse } from 'next/server'

import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  try {
    await dbConnect()
    const doc = await Blog.findById(id).lean().exec()
    if (!doc) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[blog/:id] GET', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  let body: {
    title?: string
    slug?: string
    description?: string
    image?: string
    author?: string
    published?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const title = body?.title != null ? String(body.title).trim() : undefined
  const slug = body?.slug != null ? String(body.slug).trim().toLowerCase().replace(/\s+/g, '-') : undefined
  if (title !== undefined && !title) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  }

  try {
    await dbConnect()
    const doc = await Blog.findById(id).exec()
    if (!doc) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })

    if (title != null) doc.title = title
    if (slug != null) doc.slug = slug
    if (body?.description !== undefined) doc.description = body.description ? String(body.description) : undefined
    if (body?.image !== undefined) doc.image = body.image ? String(body.image).trim() : undefined
    if (body?.author !== undefined) doc.author = body.author ? String(body.author).trim() : undefined
    if (typeof body?.published === 'boolean') {
      doc.published = body.published
      if (body.published && !doc.publishedAt) doc.publishedAt = new Date()
    }

    if (slug != null && slug !== doc.slug) {
      const existing = await Blog.findOne({ slug, _id: { $ne: id } }).lean().exec()
      if (existing) {
        return NextResponse.json({ error: 'Un autre article utilise ce slug' }, { status: 400 })
      }
    }

    await doc.save()
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[blog/:id] PUT', e)
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }
}
