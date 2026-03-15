import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit')) || 25))
  const q = url.searchParams.get('q')?.trim() || null
  const category = url.searchParams.get('category')?.trim() || null
  const skip = (page - 1) * limit

  try {
    await connectToDatabase()
    const filter: Record<string, unknown> = {}
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [
        { title: rx },
        { slug: rx },
        { description: rx },
        { brand: rx },
        { category: rx },
      ]
    }
    if (category) filter.category = category

    const [docs, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title slug price stock category brand createdAt')
        .lean()
        .exec(),
      Product.countDocuments(filter),
    ])
    const pages = Math.max(1, Math.ceil(total / limit))
    return NextResponse.json(toPlain({ items: docs, total, page, limit, pages }))
  } catch (e) {
    console.error('[admin/products] GET', e)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  try {
    const body = await req.json()
    const title = String(body?.title ?? '').trim()
    const slug = String(body?.slug ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const description = String(body?.description ?? '').trim()
    const price = Number(body?.price)
    const oldPrice = body?.oldPrice != null ? Number(body.oldPrice) : undefined
    const stock = Number.isFinite(Number(body?.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : 0
    const category = String(body?.category ?? '').trim() || undefined
    const brand = String(body?.brand ?? '').trim() || undefined
    const image = String(body?.image ?? '').trim() || undefined
    const images = Array.isArray(body?.images)
      ? body.images.filter((u: unknown) => typeof u === 'string' && u.trim())
      : typeof body?.images === 'string'
        ? body.images.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    const tags = Array.isArray(body?.tags)
      ? body.tags.filter((t: unknown) => typeof t === 'string' && t.trim())
      : typeof body?.tags === 'string'
        ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Titre et slug requis' },
        { status: 400 }
      )
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: 'Prix invalide' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const existing = await Product.findOne({ $or: [{ slug }, { sku: slug.toUpperCase() }] }).lean().exec()
    if (existing) {
      return NextResponse.json(
        { error: 'Un produit avec ce slug ou SKU existe déjà' },
        { status: 400 }
      )
    }

    const sku = (body?.sku && String(body.sku).trim())
      ? String(body.sku).trim().toUpperCase()
      : `SKU-${slug.toUpperCase().replace(/-/g, '')}-${Date.now().toString(36)}`

    const doc = await Product.create({
      sku,
      title,
      slug,
      description: description || undefined,
      price,
      oldPrice,
      stock,
      category,
      brand,
      image,
      images: images.length ? images : undefined,
      tags: tags.length ? tags : undefined,
    })

    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[admin/products] POST', e)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
