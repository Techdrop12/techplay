// ✅ /src/lib/sendConfirmationEmail.js (export nommé attendu)
import { sendBrevoEmail } from './email/sendBrevo';

export async function sendConfirmationEmail({ to, order }) {
  const subject = 'Confirmation de votre commande TechPlay';
  const html = `<h1>Merci pour votre commande !</h1>
  <p>Commande #${order._id}</p>
  <p>Total : ${order.total} €</p>
  <p>Livraison : ${order.shippingMethod || 'Standard'}</p>`;

  await sendBrevoEmail({ to, subject, html });
}
