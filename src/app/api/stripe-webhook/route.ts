// src/app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server'

// Stripe a besoin du runtime Node (pas Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// --- ENV ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_API_VERSION = (process.env.STRIPE_API_VERSION || '2024-06-20') as any
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

// --- Best-effort cache anti-doublons (non persistant en serverless) ---
const processed = new Map<string, number>() // event.id -> timestamp
const PROCESSED_TTL_MS = 60 * 60 * 1000 // 1h

function isDuplicate(id: string) {
  const now = Date.now()
  for (const [k, ts] of processed) {
    if (now - ts > PROCESSED_TTL_MS) processed.delete(k)
  }
  if (processed.has(id)) return true
  processed.set(id, now)
  return false
}

function ok(body?: any, status = 200) {
  const res = NextResponse.json(body ?? { received: true }, { status })
  res.headers.set('Cache-Control', 'no-store')
  return res
}
function err(status: number, message: string, details?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[stripe-webhook]', status, message, details ?? '')
  }
  const res = NextResponse.json({ error: message }, { status })
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export async function POST(req: Request) {
  // clés requises
  if (!STRIPE_WEBHOOK_SECRET) return err(500, 'Webhook secret manquant (STRIPE_WEBHOOK_SECRET)')
  if (!STRIPE_SECRET_KEY) return err(500, 'Clé Stripe secrète manquante (STRIPE_SECRET_KEY)')

  // Stripe envoie un RAW body → utiliser req.text()
  let payload = ''
  try {
    payload = await req.text()
  } catch {
    return err(400, 'Body illisible')
  }

  const sig = req.headers.get('stripe-signature') || ''

  // Import dynamique
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION })

  // Vérification de signature
  let event: import('stripe').Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET)
  } catch (e: any) {
    return err(400, 'Signature invalide', e?.message)
  }

  // Déduplication best-effort
  if (isDuplicate(event.id)) {
    return ok({ duplicate: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session

        // Line items (optionnel)
        let lineItems: import('stripe').Stripe.LineItem[] = []
        try {
          const res = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })
          lineItems = res.data
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[stripe-webhook] listLineItems fail:', e)
          }
        }

        const email =
          session.customer_details?.email || (session.customer_email as string | null) || undefined
        const amountTotal = typeof session.amount_total === 'number' ? session.amount_total / 100 : 0
        const currency = (session.currency || 'eur').toUpperCase()

        // Sauvegarde DB en respectant ton schéma /models/Order.js
        try {
          const { connectToDatabase } = await import('@/lib/db')
          await connectToDatabase()
          // modèle JS
          const Order = (await import('@/models/Order')).default as any

          const itemsForDb = lineItems.map((li) => ({
            title: li.description,
            quantity: li.quantity ?? 1,
            price: (li.price?.unit_amount ?? 0) / 100,
            image:
              typeof li.price?.product !== 'string'
                ? (li.price?.product as any)?.images?.[0]
                : undefined,
          }))

          const doc = {
            user: {
              email,
              name: session.customer_details?.name,
              address: session.shipping_details?.address?.line1,
              phone: session.customer_details?.phone,
            },
            email, // fallback compat
            items: itemsForDb,
            total: amountTotal,
            status: 'payé',
            shippingProvider: 'Stripe',
            shippingDetails: session.shipping_details || undefined,
            meta: {
              stripe_session_id: session.id,
              payment_status: session.payment_status,
              currency,
            },
          }

          // upsert par session Stripe (idempotent)
          await Order.findOneAndUpdate(
            { 'meta.stripe_session_id': session.id },
            { $setOnInsert: doc },
            { upsert: true, new: true }
          )
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[stripe-webhook] save order skipped/failed:', e)
          }
        }

        // Email de confirmation — conforme à sendConfirmationEmail.js
        try {
          const mod = await import('@/lib/sendConfirmationEmail.js')
          const sendConfirmationEmail =
            (mod as any).default || (mod as any).sendConfirmationEmail
          if (email && typeof sendConfirmationEmail === 'function') {
            await sendConfirmationEmail({
              to: email,
              order: {
                _id: session.id,                // identifiant lisible (Stripe session id)
                total: amountTotal,             // € attendus par le template
                shippingMethod: 'Standard',     // champ prévu par le template
              },
            })
          }
        } catch (e) {
          // silencieux si module absent/erreur email
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[stripe-webhook] email skipped:', e)
          }
        }

        break
      }

      case 'payment_intent.succeeded': {
        // si tu relies PaymentIntent ↔ Order, tu peux marquer la commande payée ici
        break
      }

      case 'charge.refunded':
      case 'charge.refund.updated': {
        // marquer la commande remboursée / partiellement remboursée si besoin
        break
      }

      default: {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[stripe-webhook] event ignoré:', event.type)
        }
      }
    }

    return ok()
  } catch (e: any) {
    return err(500, 'Erreur interne webhook', e?.message)
  }
}

// Refuse les autres méthodes
export async function GET() {
  return err(405, 'Method Not Allowed')
}
