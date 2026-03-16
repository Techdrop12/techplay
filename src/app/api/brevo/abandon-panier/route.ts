import { z } from 'zod';

import { apiSuccess } from '@/lib/apiResponse';
import { error as logError } from '@/lib/logger';
import { parseJsonBody } from '@/lib/parseJsonBody';
import { createRateLimiter, withRateLimit } from '@/lib/rateLimit';

const BodySchema = z.object({
  email: z.string().email('Email invalide'),
  cart: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .optional(),
});

const limiter = createRateLimiter({ id: 'brevo-abandon', limit: 10, intervalMs: 60_000 });

export const dynamic = 'force-dynamic';

type AbandonCartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
};

async function sendBrevoAbandonEmail(
  email: string,
  cart: AbandonCartItem[] | undefined
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const templateId = process.env.BREVO_ABANDON_TEMPLATE_ID;
  const senderEmail = process.env.BREVO_SENDER;
  const senderName = process.env.BREVO_SENDER_NAME ?? 'TechPlay';

  if (!apiKey || !templateId || !senderEmail) return false;

  const total = (cart ?? []).reduce((s, i) => s + i.price * i.quantity, 0);
  const params = {
    EMAIL: email,
    CART_ITEMS: (cart ?? [])
      .map((i) => `${i.title} x${i.quantity} – ${(i.price * i.quantity).toFixed(2)} €`)
      .join('\n'),
    CART_TOTAL: total.toFixed(2),
    CART_COUNT: String(cart?.length ?? 0),
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        templateId: Number(templateId),
        params,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      logError('[brevo/abandon-panier] Brevo API error:', res.status, text.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    logError('[brevo/abandon-panier] Send failed:', err);
    return false;
  }
}

async function handler(req: Request) {
  const parsed = await parseJsonBody(req, BodySchema);
  if (parsed.response) return parsed.response;

  const { email, cart } = parsed.data;

  if (process.env.BREVO_API_KEY && process.env.BREVO_ABANDON_TEMPLATE_ID) {
    const sent = await sendBrevoAbandonEmail(email, cart);
    return apiSuccess({ success: sent });
  }

  return apiSuccess({ success: true });
}

export const POST = withRateLimit(handler, limiter);
