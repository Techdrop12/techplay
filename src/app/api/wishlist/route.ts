import mongoose from 'mongoose'

import { error as logError } from '@/lib/logger'
import { connectToDatabase } from '@/lib/db'
import Wishlist from '@/models/Wishlist'
import { getSession } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/apiResponse'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET() {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return apiError('Non connecté', 401)
  }

  try {
    await connectToDatabase()
    const doc = await Wishlist.findOne({ email: email.toLowerCase() })
      .select('productIds')
      .lean()
      .exec()
    const ids = (doc?.productIds ?? []).map((id: { toString: () => string }) => id.toString())
    return apiSuccess(toPlain({ productIds: ids }) as Record<string, unknown>)
  } catch (e) {
    logError('[wishlist] GET', e)
    return apiError('Erreur', 500, { details: e instanceof Error ? e.message : undefined })
  }
}

export async function POST(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return apiError('Non connecté', 401)
  }

  let body: { productId?: string }
  try {
    body = await req.json()
  } catch {
    return apiError('Body JSON invalide', 400)
  }
  const productId = body?.productId != null ? String(body.productId).trim() : ''
  if (!productId) return apiError('productId manquant', 400)

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
    return apiSuccess(toPlain({ productIds: ids }) as Record<string, unknown>)
  } catch (e) {
    logError('[wishlist] POST', e)
    return apiError('Erreur', 500, { details: e instanceof Error ? e.message : undefined })
  }
}

export async function DELETE(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return apiError('Non connecté', 401)
  }

  const url = new URL(req.url)
  const productId = url.searchParams.get('productId')?.trim()
  if (!productId) return apiError('productId manquant', 400)

  try {
    await connectToDatabase()
    const oid = new mongoose.Types.ObjectId(productId)
    await Wishlist.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $pull: { productIds: oid } },
      { new: true }
    ).exec()
    return apiSuccess({ ok: true })
  } catch (e) {
    logError('[wishlist] DELETE', e)
    return apiError('Erreur', 500, { details: e instanceof Error ? e.message : undefined })
  }
}

export async function PUT(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return apiError('Non connecté', 401)
  }

  let body: { productIds?: string[] }
  try {
    body = await req.json()
  } catch {
    return apiError('Body JSON invalide', 400)
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
    return apiSuccess(toPlain({ productIds: ids }) as Record<string, unknown>)
  } catch (e) {
    logError('[wishlist] PUT', e)
    return apiError('Erreur', 500, { details: e instanceof Error ? e.message : undefined })
  }
}
