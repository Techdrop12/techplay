// src/pages/api/emails/cart-abandonne.js
import Brevo from '@getbrevo/brevo';
import dbConnect from '@/lib/dbConnect';

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@techplay.com';
const siteName = 'TechPlay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    const { email, cart } = req.body;

    if (!email || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Email ou panier invalide' });
    }

    const client = new Brevo.TransactionalEmailsApi();
    client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const productsList = cart
      .map(item => `• ${item.title} — ${item.quantity} × ${item.price} €`)
      .join('<br/>');

    const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2);

    const htmlContent = `
      <h2>Vous avez oublié quelque chose dans votre panier 🛒</h2>
      <p>Voici un rappel de votre sélection sur <strong>${siteName}</strong> :</p>
      <p>${productsList}</p>
      <p><strong>Total estimé :</strong> ${total} €</p>
      <p>
        <a href="https://techplay.vercel.app/panier" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
          Finaliser ma commande →
        </a>
      </p>
    `;

    await client.sendTransacEmail({
      to: [{ email }],
      sender: { name: siteName, email: senderEmail },
      subject: 'Vous avez oublié votre panier sur TechPlay 🛒',
      htmlContent,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur envoi mail abandon panier :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}
