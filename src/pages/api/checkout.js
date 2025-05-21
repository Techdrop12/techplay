import stripe from '../../lib/stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Méthode ${req.method} non autorisée`)
  }

  try {
    const { cart } = req.body

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide ou invalide.' })
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error)
    return res.status(500).json({ error: 'Erreur serveur Stripe' })
  }
}
