// ✅ src/pages/api/emails/cart-abandonne.js
import { sendBrevoEmail as sendBrevo } from '@/lib/email/sendBrevo';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, cart } = req.body;
  if (!email || !cart) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await sendBrevo({
      to: email,
      subject: 'Panier abandonné',
      html: `<p>Voici un récapitulatif de votre panier : ${JSON.stringify(cart)}</p>`,
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
