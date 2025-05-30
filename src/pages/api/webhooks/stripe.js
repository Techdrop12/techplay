import { buffer } from 'micro'
import Stripe from 'stripe'
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Méthode non autorisée')
  }

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Erreur signature webhook Stripe:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Connexion BDD
  await dbConnect()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const sessionId = session.id

    try {
      // Mise à jour du statut de la commande
      const order = await Order.findOne({ stripeSessionId: sessionId })

      if (order) {
        order.status = 'payée'
        await order.save()
        console.log(`Commande ${order._id} marquée comme payée`)
      } else {
        console.warn(`Commande introuvable pour session ${sessionId}`)
      }
    } catch (error) {
      console.error('Erreur mise à jour commande:', error)
    }
  }

  res.status(200).json({ received: true })
}
