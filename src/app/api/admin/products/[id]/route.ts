import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Product from '@/models/Product'
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
    await connectToDatabase()
    const doc = await Product.findById(id).lean().exec()
    if (!doc) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[admin/products/:id] GET', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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

  try {
    const body = await req.json()
    await connectToDatabase()

    const product = await Product.findById(id).exec()
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    if (body.title != null) product.title = String(body.title).trim()
    if (body.slug != null) product.slug = String(body.slug).trim().toLowerCase()
    if (body.description != null) product.description = String(body.description).trim()
    if (body.price != null) product.price = Number(body.price)
    if (body.oldPrice != null) product.oldPrice = Number(body.oldPrice)
    if (body.stock != null) product.stock = Math.max(0, Math.floor(Number(body.stock)))
    if (body.category != null) product.category = String(body.category).trim() || undefined
    if (body.brand != null) product.brand = String(body.brand).trim() || undefined
    if (body.image != null) product.image = String(body.image).trim() || undefined
    if (body.images != null) {
      product.images = Array.isArray(body.images)
        ? body.images.filter((u: unknown) => typeof u === 'string')
        : []
    }
    if (body.tags != null) {
      product.tags = Array.isArray(body.tags)
        ? body.tags.filter((t: unknown) => typeof t === 'string')
        : typeof body.tags === 'string'
          ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
          : []
    }

    await product.save()
    return NextResponse.json(toPlain(product))
  } catch (e) {
    console.error('[admin/products/:id] PUT', e)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

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
    const doc = await Product.findByIdAndDelete(id).exec()
    if (!doc) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/products/:id] DELETE', e)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
