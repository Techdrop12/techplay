// ✅ src/pages/api/brevo/abandon-panier.js

import sendBrevoEmail from '@/lib/sendBrevoEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, cart } = req.body;
  if (!email || !cart) return res.status(400).json({ error: 'Champs manquants' });

  try {
    await sendBrevoEmail({
      to: email,
      templateId: process.env.BREVO_CART_ABANDON_TEMPLATE_ID,
      params: { cart },
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
