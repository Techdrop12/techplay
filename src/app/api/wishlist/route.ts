import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Wishlist from '@/models/Wishlist'
import { getSession } from '@/lib/auth'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET() {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const doc = await Wishlist.findOne({ email: email.toLowerCase() })
      .select('productIds')
      .lean()
      .exec()
    const ids = (doc?.productIds ?? []).map((id: { toString: () => string }) => id.toString())
    return NextResponse.json(toPlain({ productIds: ids }))
  } catch (e) {
    console.error('[wishlist] GET', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  let body: { productId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }
  const productId = body?.productId != null ? String(body.productId).trim() : ''
  if (!productId) return NextResponse.json({ error: 'productId manquant' }, { status: 400 })

  try {
    await connectToDatabase()
    const oid = new mongoose.Types.ObjectId(productId)
    const doc = await Wishlist.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $addToSet: { productIds: oid } },
      { new: true, upsert: true }
    )
      .select('productIds')
      .lean()
      .exec()
    const ids = (doc?.productIds ?? []).map((id: { toString: () => string }) => id.toString())
    return NextResponse.json(toPlain({ productIds: ids }))
  } catch (e) {
    console.error('[wishlist] POST', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const url = new URL(req.url)
  const productId = url.searchParams.get('productId')?.trim()
  if (!productId) return NextResponse.json({ error: 'productId manquant' }, { status: 400 })

  try {
    await connectToDatabase()
    const oid = new mongoose.Types.ObjectId(productId)
    await Wishlist.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $pull: { productIds: oid } },
      { new: true }
    ).exec()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[wishlist] DELETE', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  let body: { productIds?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }
  const raw = body?.productIds
  const productIds = Array.isArray(raw)
    ? raw
      .map((id) => String(id).trim())
      .filter(Boolean)
      .slice(0, 50)
    : []

  try {
    await connectToDatabase()
    const oids = productIds
      .map((id) => {
        try {
          return new mongoose.Types.ObjectId(id)
        } catch {
          return null
        }
      })
      .filter(Boolean) as mongoose.Types.ObjectId[]
    const doc = await Wishlist.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { productIds: oids } },
      { new: true, upsert: true }
    )
      .select('productIds')
      .lean()
      .exec()
    const ids = (doc?.productIds ?? []).map((id: { toString: () => string }) => id.toString())
    return NextResponse.json(toPlain({ productIds: ids }))
  } catch (e) {
    console.error('[wishlist] PUT', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
