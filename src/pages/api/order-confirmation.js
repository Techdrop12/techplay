import sendBrevoEmail from '@/lib/sendBrevoEmail';
import isAdmin from '@/lib/isAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, cart, total } = req.body;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #333;">Merci pour votre commande 🛍</h2>
      <p>Bonjour,</p>
      <p>Voici le récapitulatif de votre commande :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th align="left" style="padding: 8px;">Produit</th>
            <th align="center" style="padding: 8px;">Quantité</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(i => `
            <tr>
              <td style="padding: 8px; border-top: 1px solid #ddd;">${i.title}</td>
              <td align="center" style="padding: 8px; border-top: 1px solid #ddd;">${i.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-weight: bold;">Total : ${total.toFixed(2)} €</p>
      <p>📦 Vous recevrez un mail dès l’expédition.</p>
      <p>Merci pour votre confiance,<br>L'équipe TechPlay</p>
    </div>
  `;

  try {
    const isUserAdmin = await isAdmin(req);

    if (isUserAdmin) {
      console.log(`[Brevo] Email ignoré pour admin : ${email}`);
      return res.status(200).json({ message: 'Email non envoyé (admin)' });
    }

    await sendBrevoEmail({
      to: email,
      subject: 'Confirmation de votre commande',
      html
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur Brevo:', error.message);
    res.status(500).json({ error: 'Erreur envoi email' });
  }
}
