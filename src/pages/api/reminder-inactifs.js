// ✅ /src/pages/api/reminder-inactifs.js (relance clients inactifs, bonus marketing)
import { sendBrevoEmail } from '@/lib/sendBrevoEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, name, lastOrderDate } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    await sendBrevoEmail({
      to: email,
      subject: "Nous n'avons pas de nouvelles de vous !",
      text: `Bonjour ${name || ''},\n\nCela fait un moment depuis votre dernière commande (${lastOrderDate || '...'}).\nDécouvrez nos nouveautés et profitez d'une offre spéciale !`
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
