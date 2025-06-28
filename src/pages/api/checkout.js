// ✅ /src/pages/api/checkout.js (checkout Stripe)
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();
  const { items, user } = req.body;

  // Vérification basique
  if (!items || !Array.isArray(items) || !user?.email) {
    return res.status(400).json({ error: 'Invalid payload.' });
  }

  try {
    // Calcul du total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Création de la commande en base pour suivi
    const order = await Order.create({
      user,
      email: user.email,
      items,
      total,
      status: 'en cours'
    });

    // Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title,
            images: [item.image]
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?orderId=${order._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/panier?cancelled=1`,
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString()
      }
    });

    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
