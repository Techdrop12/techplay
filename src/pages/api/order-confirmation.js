// ✅ /src/pages/api/order-confirmation.js (confirmation de commande)
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { order } = req.body;
    if (!order) return res.status(400).json({ error: 'Order required' });
    await sendConfirmationEmail(order);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
