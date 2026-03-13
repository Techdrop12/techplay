import { headers } from 'next/headers'

import type Stripe from 'stripe'

import { serverEnv } from '@/env.server'
import { apiError, apiJson, safeErrorForLog } from '@/lib/apiResponse'
import { createOrder, getOrderByStripeEventId } from '@/lib/db/orders'
import { error as logError } from '@/lib/logger'
import stripe from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export async function POST(req: Request) {
  const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    if (IS_PRODUCTION) return apiError('Service non configuré', 503)
    return apiError('Webhook non configuré', 500)
  }

  const hdrs = await headers()
  const sig = hdrs.get('stripe-signature')
  if (!sig) return apiError('Signature manquante', 400)

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    logError('[stripe-webhook] signature invalide', safeErrorForLog(err))
    return apiError('Signature invalide', 400)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const existing = await getOrderByStripeEventId(event.id)
        if (existing) {
          return apiJson({ received: true, duplicate: true })
        }

        const email =
          session.customer_details?.email || (session.customer_email as string | null) || ''

        const total =
          typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined

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
        break
      }

      default: {
        break
      }
    }

    return apiJson({ received: true })
  } catch (err) {
    logError('[stripe-webhook] erreur de traitement', safeErrorForLog(err))
    return apiError('Erreur interne', 500)
  }
}