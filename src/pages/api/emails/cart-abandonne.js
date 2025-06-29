import { sendBrevoEmail as sendBrevo } from '@/lib/email/sendBrevo'; // alias correct

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, cart } = req.body;
  if (!email || !cart) return res.status(400).json({ error: 'Missing fields' });

  await sendBrevo({
    to: [{ email }],
    templateId: parseInt(process.env.BREVO_CART_ABANDON_TEMPLATE_ID, 10),
    params: { cart },
  });

  res.status(200).json({ ok: true });
}