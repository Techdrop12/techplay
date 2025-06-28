// ✅ /src/pages/api/contact.js (formulaire contact, envoi via Brevo)
import { sendBrevoEmail } from '@/lib/sendBrevoEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }
  try {
    await sendBrevoEmail({
      to: process.env.CONTACT_EMAIL,
      subject: `Contact TechPlay de ${name}`,
      text: message,
      replyTo: email
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
