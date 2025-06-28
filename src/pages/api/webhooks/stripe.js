// ✅ /src/pages/api/webhooks/stripe.js (webhook Stripe nouvelle version, fallback sécurité)
import Stripe from 'stripe';
import { buffer } from 'micro';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  await dbConnect();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: 'payée' });
    }
  }

  res.status(200).json({ received: true });
}
