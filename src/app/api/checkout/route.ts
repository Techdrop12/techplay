// src/app/api/checkout/route.ts
import crypto from 'crypto'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { serverEnv } from '@/env.server'
import { ipFromRequest } from '@/lib/rateLimit'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const STRIPE_KEY = serverEnv.STRIPE_SECRET_KEY || ''
const ALLOWED_ORIGINS = [SITE_URL]
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20

export const dynamic = 'force-dynamic'
export const revalidate = 0

const bucket = new Map<string, { count: number; ts: number }>()

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
  currency: z.enum(['EUR', 'GBP', 'USD']).optional(),
  locale: z.string().min(2).max(5).optional(),
  idempotencyKey: z.string().optional(),
})

type AllowedCurrency = 'EUR' | 'GBP' | 'USD'
type AllowedCountry = 'FR' | 'BE' | 'LU' | 'DE' | 'ES' | 'IT' | 'GB' | 'US'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function toAllowedCountries(input: unknown): AllowedCountry[] {
  const fallback: AllowedCountry[] = ['FR']

  const normalize = (value: string): AllowedCountry | null => {
    const upper = value.trim().toUpperCase()
    const allowed: AllowedCountry[] = ['FR', 'BE', 'LU', 'DE', 'ES', 'IT', 'GB', 'US']
    return allowed.includes(upper as AllowedCountry) ? (upper as AllowedCountry) : null
  }

  if (Array.isArray(input)) {
    const out = input
      .filter((s): s is string => typeof s === 'string')
      .map(normalize)
      .filter((s): s is AllowedCountry => s !== null)

    return out.length > 0 ? out : fallback
  }

  if (typeof input === 'string') {
    const out = input
      .split(',')
      .map(normalize)
      .filter((s): s is AllowedCountry => s !== null)

    return out.length > 0 ? out : fallback
  }

  return fallback
}

function rateLimitCheck(ip: string): boolean {
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

function originAllowed(req: Request): boolean {
  const origin = req.headers.get('origin') || ''
  const referer = req.headers.get('referer') || ''

  return (
    !origin ||
    ALLOWED_ORIGINS.some((allowedOrigin) => {
      return origin.startsWith(allowedOrigin) || referer.startsWith(allowedOrigin)
    })
  )
}

function json(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

function hashIdempotency(payload: unknown, ip: string): string {
  const h = crypto.createHash('sha256')
  h.update(JSON.stringify(payload))
  h.update('|')
  h.update(ip)
  return h.digest('hex')
}

export async function POST(request: Request) {
  try {
    if (!originAllowed(request)) {
      return json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = ipFromRequest(request)
    if (!rateLimitCheck(ip)) {
      return json({ error: 'Too many requests' }, { status: 429 })
    }

    const raw = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(raw)

    if (!parsed.success) {
      return json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data

    const idem =
      body.idempotencyKey ||
      request.headers.get('x-idempotency-key') ||
      hashIdempotency(
        { email: body.email, address: body.address, items: body.items },
        ip
      )

    const origin = new URL(SITE_URL).origin
    const successUrl = `${origin}/commande/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/commande`

    const currency: AllowedCurrency = (
      body.currency ||
      body.items?.[0]?.currency?.toUpperCase() ||
      'EUR'
    ) as AllowedCurrency

    const allowedCountries: AllowedCountry[] =
      currency === 'GBP'
        ? ['GB']
        : currency === 'USD'
          ? ['US']
          : ['FR', 'BE', 'LU', 'DE', 'ES', 'IT']

    if (STRIPE_KEY) {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(STRIPE_KEY)

      const liCurrency = currency.toLowerCase()

      const line_items =
        body.items && body.items.length > 0
          ? body.items.map((it) => ({
              price_data: {
                currency: liCurrency,
                unit_amount: Math.round(it.price * 100),
                product_data: {
                  name: it.name,
                  images: it.image ? [it.image] : undefined,
                },
              },
              quantity: it.quantity,
              adjustable_quantity: {
                enabled: true,
                minimum: 1,
                maximum: 99,
              },
            }))
          : [
              {
                price_data: {
                  currency: liCurrency,
                  unit_amount: 100,
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
          shipping_address_collection: {
            allowed_countries: toAllowedCountries(allowedCountries),
          },
          billing_address_collection: 'auto',
          allow_promotion_codes: true,
          line_items,
          automatic_tax: { enabled: false },
          metadata: {
            address: body.address.slice(0, 500),
            items_count: String(body.items?.reduce((a, i) => a + i.quantity, 0) || 1),
            currency,
            idem,
            locale: body.locale || 'fr',
          },
        },
        { idempotencyKey: idem }
      )

      return json({ id: session.id, url: session.url })
    }

    const mockUrl = `${origin}/commande/success?mock=1`
    return json({ id: `sess_mock_${idem.slice(0, 10)}`, url: mockUrl })
  } catch (err: unknown) {
    console.error('[checkout] error:', err)

    return json(
      {
        error: 'Unexpected error',
        details: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return json({ error: 'Method Not Allowed' }, { status: 405 })
}