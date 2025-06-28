// ✅ /src/pages/api/post-achat.js (relance post-achat, bonus satisfaction client)
import { sendBrevoEmail } from '@/lib/sendBrevoEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { email, name, orderId } = req.body;
    if (!email || !orderId) {
      return res.status(400).json({ error: 'Missing params' });
    }
    await sendBrevoEmail({
      to: email,
      subject: `Merci pour votre commande TechPlay !`,
      text: `Merci ${name || ''} pour votre commande ${orderId} sur TechPlay. N'hésitez pas à nous faire un retour ou laisser un avis !`
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
