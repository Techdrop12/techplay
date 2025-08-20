// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'

// ⚙️ Options
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || ''
const ALLOWED_ORIGINS = [SITE_URL]
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20

export const dynamic = 'force-dynamic' // jamais mis en cache côté Next
export const revalidate = 0

// 🧱 In-memory rate limit (best-effort; peut reset en serverless)
const bucket = new Map<string, { count: number; ts: number }>()

// ✅ Schéma d’entrée (souple: items optionnels)
const LineItem = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().max(99),
  image: z.string().url().optional(),
  currency: z.string().default('EUR').transform((v) => v.toLowerCase()),
})
const BodySchema = z.object({
  email: z.string().email(),
  address: z.string().min(6),
  items: z.array(LineItem).optional(),
  currency: z.string().optional(), // fallback sur items / EUR
  locale: z.string().optional(),   // ex: 'fr'
  // idempotency proposé par le client (sinon calculé)
  idempotencyKey: z.string().optional(),
})

function ipFromHeaders(req: Request) {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') || '0.0.0.0'
}

function rateLimitCheck(ip: string) {
  const now = Date.now()
  const rec = bucket.get(ip)
  if (!rec || now - rec.ts > RATE_LIMIT_WINDOW_MS) {
    bucket.set(ip, { count: 1, ts: now })
    return true
  }
  if (rec.count >= RATE_LIMIT_MAX) return false
  rec.count++
  return true
}

function originAllowed(req: Request) {
  const origin = req.headers.get('origin') || ''
  const referer = req.headers.get('referer') || ''
  return (
    !origin || // SSR/fetch interne
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o) || referer.startsWith(o))
  )
}

function json(data: any, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

function hashIdempotency(payload: unknown, ip: string) {
  const h = crypto.createHash('sha256')
  h.update(JSON.stringify(payload))
  h.update('|')
  h.update(ip)
  return h.digest('hex')
}

export async function POST(request: Request) {
  try {
    // 🔒 Origine
    if (!originAllowed(request)) {
      return json({ error: 'Forbidden' }, { status: 403 })
    }

    // ⏱️ Rate-limit
    const ip = ipFromHeaders(request)
    if (!rateLimitCheck(ip)) {
      return json({ error: 'Too many requests' }, { status: 429 })
    }

    // 🔎 Validation
    const raw = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    // 🆔 Idempotency
    const idem =
      body.idempotencyKey ||
      request.headers.get('x-idempotency-key') ||
      hashIdempotency({ email: body.email, address: body.address, items: body.items }, ip)

    // 🌍 URLs
    const origin = new URL(SITE_URL).origin
    const successUrl = `${origin}/commande/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/commande`

    // 💳 Stripe Checkout (si clé dispo)
    if (STRIPE_KEY) {
      // Import dynamique pour éviter d’imposer stripe en dev si non utilisé
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' as any })

      // Line items
      const currency = (body.currency || body.items?.[0]?.currency || 'eur').toLowerCase()
      const line_items =
        body.items && body.items.length
          ? body.items.map((it) => ({
              price_data: {
                currency,
                unit_amount: Math.round(it.price * 100),
                product_data: { name: it.name, images: it.image ? [it.image] : undefined },
              },
              quantity: it.quantity,
              adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
            }))
          : [
              {
                price_data: {
                  currency,
                  unit_amount: 100, // 1.00€ “placeholder” si aucun item n’est fourni
                  product_data: { name: 'Commande TechPlay' },
                },
                quantity: 1,
              },
            ]

      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          submit_type: 'pay',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: body.email,
          phone_number_collection: { enabled: true },
          shipping_address_collection: { allowed_countries: ['FR', 'BE', 'LU'] },
          billing_address_collection: 'auto',
          allow_promotion_codes: true,
          line_items,
          metadata: {
            address: body.address.slice(0, 500),
            items_count: (body.items?.reduce((a, i) => a + i.quantity, 0) || 1).toString(),
            idem,
          },
        },
        { idempotencyKey: idem }
      )

      return json({ id: session.id, url: session.url })
    }

    // 🧪 Fallback “mock” sans Stripe (dev / clé absente)
    const mockUrl = `${origin}/commande/success?mock=1`
    return json({ id: 'sess_mock_' + idem.slice(0, 10), url: mockUrl })
  } catch (err: any) {
    console.error('[checkout] error:', err)
    return json(
      { error: 'Unexpected error', details: process.env.NODE_ENV === 'development' ? String(err?.message || err) : undefined },
      { status: 500 }
    )
  }
}

// Optionnel: refuse autres méthodes
export async function GET() {
  return json({ error: 'Method Not Allowed' }, { status: 405 })
}
