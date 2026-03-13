import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createRateLimiter, withRateLimit } from '@/lib/rateLimit'

const SubscribeSchema = z.object({
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

  // Ici : persister parsed.data en BDD (web-push). Ne pas logger le contenu.
  return NextResponse.json({ success: true })
}

export const POST = withRateLimit(handler, limiter)
