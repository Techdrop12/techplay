import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, order } = req.body;
    if (!email || !order) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    await sendConfirmationEmail({ to: email, order });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
