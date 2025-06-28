// ✅ /src/lib/sendConfirmationEmail.js (email commande, réutilise Brevo)
import { sendBrevoEmail } from './sendBrevoEmail';

export async function sendOrderConfirmationEmail({ to, order }) {
  const subject = 'Confirmation de votre commande TechPlay';
  const html = `<h1>Merci pour votre commande !</h1>
  <p>Commande #${order._id}</p>
  <p>Total : ${order.total} €</p>
  <p>Livraison : ${order.shippingMethod || 'Standard'}</p>`;
  await sendBrevoEmail({ to, subject, html });
}
