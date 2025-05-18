// 📁 /pages/api/checkout.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { cart } = req.body

  const line_items = cart.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.title,
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }))

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/panier`,
    })
    res.status(200).json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: 'Échec création session Stripe' })
  }
}
