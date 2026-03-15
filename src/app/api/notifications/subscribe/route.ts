import { NextResponse } from 'next/server'
import { z } from 'zod'

import { connectToDatabase } from '@/lib/db'
import NewsletterSubscriber from '@/models/NewsletterSubscriber'
import { createRateLimiter, withRateLimit } from '@/lib/rateLimit'

const SubscribeSchema = z.object({
  email: z.string().email().optional(),
  locale: z.string().optional(),
  pathname: z.string().optional(),
  endpoint: z.string().url().optional(),
  keys: z.record(z.string(), z.unknown()).optional(),
  expirationTime: z.number().nullable().optional(),
}).passthrough()

const limiter = createRateLimiter({ id: 'notifications-subscribe', limit: 20, intervalMs: 60_000 })

export const dynamic = 'force-dynamic'

async function handler(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Payload invalide' }, { status: 400 })
  }

  const parsed = SubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Payload invalide' }, { status: 400 })
  }

  const email = parsed.data?.email && typeof parsed.data.email === 'string' ? parsed.data.email.trim().toLowerCase() : null
  if (email) {
    try {
      await connectToDatabase()
      await NewsletterSubscriber.findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            locale: parsed.data?.locale ?? undefined,
            pathname: parsed.data?.pathname ?? undefined,
            source: 'footer',
          },
        },
        { upsert: true, new: true }
      )
    } catch (e) {
      console.error('[notifications/subscribe] newsletter save', e)
    }
  }

  return NextResponse.json({ success: true })
}

export const POST = withRateLimit(handler, limiter)
