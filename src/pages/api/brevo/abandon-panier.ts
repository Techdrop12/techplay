// pages/api/brevo/abandon-panier.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendBrevoEmail } from '@/lib/email/sendBrevo';

type CartItem = {
  name: string;
  price: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, cartItems, lang = 'fr' }: { email: string; cartItems: CartItem[]; lang?: string } = req.body;

  if (!email || !cartItems?.length)
    return res.status(400).json({ error: 'Missing data' });

  const subject = lang === 'fr' ? 'Vous avez oublié votre panier 🛒' : 'You left something behind 🛒';

  const htmlContent = `
    <h2>${subject}</h2>
    <p>${lang === 'fr' ? 'Voici ce que vous aviez ajouté :' : "Here's what you added:"}</p>
    <ul>
      ${cartItems
        .map((item: CartItem) => `<li>${item.name} – ${item.price}€</li>`)
        .join('')}
    </ul>
    <p><a href="https://techplay.com/cart">${lang === 'fr' ? 'Revenir à mon panier' : 'Back to my cart'}</a></p>
  `;

  try {
    await sendBrevoEmail({ to: email, subject, htmlContent });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Email failed' });
  }
}
