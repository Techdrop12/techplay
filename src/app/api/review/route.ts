// src/app/api/review/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import mongoose, { Schema, model, models } from 'mongoose'
import { createRateLimiter, ipFromRequest, withRateLimit } from '@/lib/rateLimit'

// ------------- Rate limit (5 req / min par IP, fenêtre glissante) -------------
const limiter = createRateLimiter({
  id: 'review',
  limit: 5,
  intervalMs: 60_000,
  strategy: 'sliding-window',
})

// ------------- Validation -------------
const ReviewSchemaZ = z.object({
  productId: z.string().min(1, 'productId requis'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
  email: z.string().email().optional(),
  recaptchaToken: z.string().optional(),
  hp: z.string().optional(), // champ honeypot -> doit rester vide
})

// ------------- ReCAPTCHA (optionnel) -------------
async function verifyRecaptcha(token: string | undefined, ip: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret || !token) return { ok: true, score: 0 } // pas configuré -> on laisse passer
  const body = new URLSearchParams({ secret, response: token, remoteip: ip })
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    // timeout / abort non nécessaire ici
  })
  const json = (await res.json()) as any
  const ok = !!json.success && (json.score == null || json.score >= 0.4)
  return { ok, score: json.score ?? 0 }
}

// ------------- Mongo (optionnel) -------------
const MONGO_URI = process.env.MONGODB_URI

type ReviewDoc = {
  productId: string
  email?: string
  rating: number
  comment: string
  ip: string
  idempotencyKey: string
  createdAt: Date
}

let ReviewModel: mongoose.Model<ReviewDoc>
if (MONGO_URI) {
  const ReviewMongooseSchema =
    (models.Review as mongoose.Model<ReviewDoc> | undefined)?.schema ??
    new Schema<ReviewDoc>(
      {
        productId: { type: String, index: true, required: true },
        email: { type: String, index: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, required: true },
        ip: { type: String, index: true },
        idempotencyKey: { type: String, unique: true, index: true },
        createdAt: { type: Date, default: () => new Date(), index: true },
      },
      { versionKey: false }
    )

  ReviewModel = models.Review || model<ReviewDoc>('Review', ReviewMongooseSchema)
}

// ------------- Idempotency (fallback mémoire si pas de DB) -------------
const memIds = (globalThis as any).__REV_MEM__ || new Set<string>()
;(globalThis as any).__REV_MEM__ = memIds

function makeIdemKey(input: { productId: string; email?: string; comment: string; ip: string }) {
  const base = `${input.productId}|${(input.email || '').toLowerCase()}|${input.comment.trim()}|${input.ip}`
  return crypto.createHash('sha256').update(base).digest('hex')
}

// ------------- Petite sanitation anti-HTML -------------
function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, '').trim()
}

// ------------- Handler principal (protégé par rate limit) -------------
async function handler(request: Request) {
  const ip = ipFromRequest(request)

  let payload: z.infer<typeof ReviewSchemaZ>
  try {
    payload = ReviewSchemaZ.parse(await request.json())
  } catch (e) {
    const msg = (e as any)?.errors?.[0]?.message || 'Payload invalide'
    const res = limiter.check(ip)
    return NextResponse.json({ success: false, error: msg }, { status: 400, headers: limiter.headers(res) })
  }

  // Honeypot
  if (payload.hp && payload.hp.trim() !== '') {
    const res = limiter.check(ip)
    return NextResponse.json({ success: true, message: 'Ok' }, { status: 200, headers: limiter.headers(res) })
  }

  // reCAPTCHA si configuré
  const captcha = await verifyRecaptcha(payload.recaptchaToken, ip)
  if (!captcha.ok) {
    const res = limiter.check(ip)
    return NextResponse.json({ success: false, error: 'Captcha invalide' }, { status: 400, headers: limiter.headers(res) })
  }

  const doc: Omit<ReviewDoc, 'createdAt'> = {
    productId: payload.productId,
    email: payload.email?.toLowerCase(),
    rating: payload.rating,
    comment: stripTags(payload.comment),
    ip,
    idempotencyKey: makeIdemKey({ productId: payload.productId, email: payload.email, comment: payload.comment, ip }),
  }

  // Déduplication mémoire (si pas de DB)
  if (!MONGO_URI) {
    if (memIds.has(doc.idempotencyKey)) {
      const res = limiter.check(ip)
      return NextResponse.json({ success: true, message: 'Avis déjà reçu' }, { status: 200, headers: limiter.headers(res) })
    }
    memIds.add(doc.idempotencyKey)
  }

  // Insertion DB si MONGO_URI configuré
  if (MONGO_URI) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI)
    }
    try {
      await ReviewModel.create({ ...doc, createdAt: new Date() })
    } catch (err: any) {
      // duplication (idempotency)
      if (err?.code === 11000) {
        const res = limiter.check(ip)
        return NextResponse.json({ success: true, message: 'Avis déjà reçu' }, { status: 200, headers: limiter.headers(res) })
      }
      console.error('[review] DB error:', err)
      const res = limiter.check(ip)
      return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500, headers: limiter.headers(res) })
    }
  }

  const res = limiter.check(ip)
  return NextResponse.json({ success: true, message: 'Avis reçu' }, { status: 200, headers: limiter.headers(res) })
}

// 👉 export: on enveloppe le handler avec le middleware de rate limit pour retour des bons headers 429
export const POST = withRateLimit(handler, limiter)
