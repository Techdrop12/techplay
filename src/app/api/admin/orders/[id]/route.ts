import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/requireAdmin'

const ALLOWED_STATUSES = ['en cours', 'en préparation', 'payée', 'expédiée', 'livrée', 'annulée'] as const

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
    const doc = await Order.findById(id).lean().exec()
    if (!doc) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[admin/orders/:id] GET', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const status = body?.status != null ? String(body.status).trim() : ''
  if (!status) return NextResponse.json({ error: 'Statut manquant' }, { status: 400 })
  if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return NextResponse.json(
      { error: `Statut invalide. Autorisés: ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    await connectToDatabase()
    const doc = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    )
      .lean()
      .exec()
    if (!doc) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    return NextResponse.json(toPlain(doc))
  } catch (e) {
    console.error('[admin/orders/:id] PATCH', e)
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }
}
