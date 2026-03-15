import { NextResponse } from 'next/server'

import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

function slugify(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  let body: { title?: string; slug?: string; description?: string; image?: string; author?: string; published?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const title = body?.title != null ? String(body.title).trim() : ''
  if (!title) return NextResponse.json({ error: 'Titre manquant' }, { status: 400 })

  const slug =
    body?.slug != null && String(body.slug).trim()
      ? String(body.slug).trim().toLowerCase().replace(/\s+/g, '-')
      : slugify(title)

  try {
    await dbConnect()
    const existing = await Blog.findOne({ slug }).lean().exec()
    if (existing) {
      return NextResponse.json(
        { error: 'Un article avec ce slug existe déjà' },
        { status: 400 }
      )
    }

    const published = Boolean(body?.published)
    const doc = await Blog.create({
      title,
      slug,
      description: body?.description != null ? String(body.description) : undefined,
      image: body?.image != null ? String(body.image).trim() : undefined,
      author: body?.author != null ? String(body.author).trim() : undefined,
      published,
      publishedAt: published ? new Date() : undefined,
    })

    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[blog] POST', e)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
