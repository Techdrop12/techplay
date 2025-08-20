// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'

export const runtime = 'nodejs'           // Stripe SDK nécessite Node.js (pas Edge)
export const dynamic = 'force-dynamic'
export const revalidate = 0

// ⚙️ Options & ENV
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_API_VERSION = (process.env.STRIPE_API_VERSION || '2024-06-20') as any

// CORS : autorise site + localhost
const ALLOWED_ORIGINS = new Set<string>([
  SITE_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20

// 🧱 In-memory rate limit (best-effort)
const bucket = new Map<string, { count: number; ts: number }>()

// ========== Utils ==========
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
  if (!origin && !referer) return true // fetch interne/SSR
  for (const o of ALLOWED_ORIGINS) {
    if (origin.startsWith(o) || referer.startsWith(o)) return true
  }
  return false
}

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = [...ALLOWED_ORIGINS].find((o) => origin.startsWith(o))
  return {
    'Access-Control-Allow-Origin': allowed || SITE_URL,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key, Accept-Language',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  }
}

function json(data: any, init?: ResponseInit, req?: Request) {
  const res = NextResponse.json(data, init)
  const h = req ? corsHeaders(req) : { 'Cache-Control': 'no-store' }
  for (const [k, v] of Object.entries(h)) res.headers.set(k, v as string)
  return res
}

function hashIdempotency(payload: unknown, ip: string) {
  const h = crypto.createHash('sha256')
  h.update(JSON.stringify(payload))
  h.update('|')
  h.update(ip)
  return h.digest('hex')
}

// ========== Validation ==========
const LineItem = z.object({
  name: z.string().min(1).max(120).transform((s) => s.trim()),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().max(99),
  image: z.string().url().optional(),
  currency: z.string().default('EUR').transform((v) => v.toLowerCase()),
})

const BodySchema = z.object({
  email: z.string().email().transform((s) => s.trim()),
  address: z.string().min(6).max(500).transform((s) => s.trim()),
  items: z.array(LineItem).max(50).optional(),
  currency: z.string().optional(),
  locale: z.string().optional(), // ex: 'fr'
  idempotencyKey: z.string().optional(),
})

// ========= CORS preflight =========
export async function OPTIONS(request: Request) {
  if (!originAllowed(request)) {
    return json({ error: 'Forbidden' }, { status: 403 }, request)
  }
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  })
}

// ========= POST /api/checkout =========
export async function POST(request: Request) {
  try {
    // CORS + origine
    if (!originAllowed(request)) {
      return json({ error: 'Forbidden' }, { status: 403 }, request)
    }

    // Rate-limit
    const ip = ipFromHeaders(request)
    if (!rateLimitCheck(ip)) {
      return json({ error: 'Too many requests' }, { status: 429 }, request)
    }

    // Validation
    const raw = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 }, request)
    }
    const body = parsed.data

    // Idempotency (client > header > hash)
    const idem =
      body.idempotencyKey ||
      request.headers.get('x-idempotency-key') ||
      hashIdempotency({ email: body.email, address: body.address, items: body.items }, ip)

    // URLs
    const base = new URL(SITE_URL).origin
    const successUrl = `${base}/commande/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${base}/commande`

    // Subtotal pour logique shipping/free
    const subtotal =
      body.items?.reduce((s, it) => s + it.price * it.quantity, 0) ?? 0
    const FREE_SHIP_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 0)

    // 💳 Stripe
    if (STRIPE_KEY) {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(STRIPE_KEY, { apiVersion: STRIPE_API_VERSION })

      const currency = (body.currency || body.items?.[0]?.currency || 'eur').toLowerCase()

      const line_items =
        body.items && body.items.length
          ? body.items.map((it) => ({
              price_data: {
                currency,
                unit_amount: Math.round(Math.max(0, it.price) * 100),
                product_data: {
                  name: it.name,
                  images: it.image ? [it.image] : undefined,
                },
              },
              quantity: it.quantity,
              adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
            }))
          : [
              {
                price_data: {
                  currency,
                  unit_amount: 100, // 1.00€ “placeholder”
                  product_data: { name: 'Commande TechPlay' },
                },
                quantity: 1,
              },
            ]

      // Shipping options via rate IDs (facultatif)
      const shipping_options: Array<{ shipping_rate: string }> = []
      if (process.env.STRIPE_SHIPPING_RATE_STANDARD)
        shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_STANDARD })
      if (process.env.STRIPE_SHIPPING_RATE_EXPRESS)
        shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_EXPRESS })
      if (process.env.STRIPE_SHIPPING_RATE_FREE && FREE_SHIP_THRESHOLD > 0 && subtotal >= FREE_SHIP_THRESHOLD) {
        shipping_options.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE_FREE })
      }

      // Metadata compacte (<= 500 char)
      const miniCart = JSON.stringify(
        (body.items || []).slice(0, 15).map((i) => ({
          n: i.name.slice(0, 30),
          q: i.quantity,
          p: i.price,
        }))
      ).slice(0, 480)

      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          submit_type: 'pay',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: body.email,
          locale: (body.locale as any) || 'auto',
          phone_number_collection: { enabled: true },
          shipping_address_collection: { allowed_countries: ['FR', 'BE', 'LU'] },
          billing_address_collection: 'auto',
          allow_promotion_codes: true,
          line_items,
          ...(shipping_options.length ? { shipping_options } : {}),
          automatic_tax: { enabled: false },
          client_reference_id: idem.slice(0, 36),
          metadata: {
            address: body.address.slice(0, 500),
            items_count: (body.items?.reduce((a, i) => a + i.quantity, 0) || 1).toString(),
            cart: miniCart,
            idem,
          },
        },
        { idempotencyKey: idem }
      )

      return json({ id: session.id, url: session.url }, { status: 200 }, request)
    }

    // 🧪 Fallback “mock” sans Stripe (dev / clé absente)
    const mockUrl = `${base}/commande/success?mock=1`
    return json({ id: 'sess_mock_' + idem.slice(0, 10), url: mockUrl }, { status: 200 }, request)
  } catch (err: any) {
    console.error('[checkout] error:', err)
    return json(
      {
        error: 'Unexpected error',
        details: process.env.NODE_ENV === 'development' ? String(err?.message || err) : undefined,
      },
      { status: 500 }
    )
  }
}

// Refuse GET
export async function GET(request: Request) {
  return json({ error: 'Method Not Allowed' }, { status: 405 }, request)
}
