import stripe from '@/lib/stripe'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import Order from '@/models/Order'

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

    await dbConnect()

    const verifiedItems = []
    let total = 0

    for (const item of cart) {
      const product = await Product.findById(item._id)
      if (!product) {
        return res.status(400).json({ error: `Produit introuvable: ${item.title}` })
      }

      const quantity = Math.max(1, item.quantity)
      const unitPrice = Math.round(product.price * 100)

      total += product.price * quantity

      verifiedItems.push({
        title: product.title,
        price: product.price,
        quantity,
        _id: product._id,
      })

      item.stripeData = {
        price_data: {
          currency: 'eur',
          product_data: { name: product.title },
          unit_amount: unitPrice,
        },
        quantity,
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items: verifiedItems.map(i => i.stripeData),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: {
        email: cart[0]?.email || 'inconnu',
      },
    })

    await Order.create({
      email: cart[0]?.email || 'inconnu',
      items: verifiedItems,
      total,
      stripeSessionId: session.id,
      status: 'en attente',
    })

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cart[0]?.email || 'inconnu',
        cart: verifiedItems,
        total,
      }),
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error)
    return res.status(500).json({ error: 'Erreur serveur Stripe' })
  }
}
