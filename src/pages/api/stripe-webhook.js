import { buffer } from 'micro'
import Stripe from 'stripe'
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('❌ Erreur vérification webhook :', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    await dbConnect()

    try {
      await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: 'payée' }
      )
      console.log('✅ Paiement confirmé pour commande', session.id)
    } catch (e) {
      console.error('❌ Erreur mise à jour commande', e)
    }
  }

  res.json({ received: true })
}
