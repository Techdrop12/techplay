import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { serverEnv } from '@/env.server'
import stripe from '@/lib/stripe'
import { createOrder, getOrderByStripeEventId } from '../../../lib/db/orders.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = serverEnv.STRIPE_WEBHOOK_SECRET || ''

function json(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export async function POST(req: Request) {
  const hdrs = await headers()
  const sig = hdrs.get('stripe-signature')

  if (!WEBHOOK_SECRET || !sig) {
    return json({ error: 'Webhook non configuré' }, { status: 500 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] signature invalide', err)
    return json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const existing = await getOrderByStripeEventId(event.id)
        if (existing) {
          return json({ received: true, duplicate: true })
        }

        const email =
          session.customer_details?.email ||
          (session.customer_email as string | null) ||
          ''

        const total =
          typeof session.amount_total === 'number'
            ? session.amount_total / 100
            : undefined

        if (email) {
          await createOrder({
            user: { email },
            email,
            total,
            status: 'payée',
            meta: {
              ...(session.metadata || {}),
              stripeSessionId: session.id,
              stripeEventId: event.id,
              stripePaymentIntentId: session.payment_intent || undefined,
            },
          })
        }

        break
      }

      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        // Ici, on pourrait éventuellement marquer une commande comme échouée.
        break
      }

      default: {
        // Pour les autres événements, on se contente d'accuser réception.
        break
      }
    }

    return json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] erreur de traitement', err)
    return json({ error: 'Erreur interne' }, { status: 500 })
  }
}