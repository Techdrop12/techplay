import crypto from 'crypto';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { error as logError } from '@/lib/logger';
import { connectToDatabase } from '@/lib/db';
import { sendBrevoEmail } from '@/lib/email/sendBrevo';
import { BRAND } from '@/lib/constants';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { createRateLimiter, withRateLimit } from '@/lib/rateLimit';

const SubscribeSchema = z
  .object({
    email: z.string().email().optional(),
    locale: z.string().optional(),
    pathname: z.string().optional(),
    endpoint: z.string().url().optional(),
    keys: z.record(z.string(), z.unknown()).optional(),
    expirationTime: z.number().nullable().optional(),
  })
  .passthrough();

const limiter = createRateLimiter({ id: 'notifications-subscribe', limit: 20, intervalMs: 60_000 });

export const dynamic = 'force-dynamic';

async function handler(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Payload invalide' }, { status: 400 });
  }

  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Payload invalide' }, { status: 400 });
  }

  const email =
    parsed.data?.email && typeof parsed.data.email === 'string'
      ? parsed.data.email.trim().toLowerCase()
      : null;
  if (email) {
    try {
      await connectToDatabase();

      const existing = await NewsletterSubscriber.findOne({ email }).select('confirmed').lean().exec();
      const alreadyConfirmed = existing && (existing as { confirmed?: boolean }).confirmed;

      if (!alreadyConfirmed) {
        const confirmToken = crypto.randomUUID();
        await NewsletterSubscriber.findOneAndUpdate(
          { email },
          {
            $set: {
              email,
              locale: parsed.data?.locale ?? undefined,
              pathname: parsed.data?.pathname ?? undefined,
              source: 'footer',
              confirmToken,
              confirmed: false,
            },
          },
          { upsert: true, new: true }
        );

        const confirmUrl = `${BRAND.URL}/api/email/newsletter-confirm?token=${confirmToken}`;
        void sendBrevoEmail({
          to: email,
          subject: 'Confirmez votre inscription à la newsletter TechPlay',
          html: `
            <p>Bonjour,</p>
            <p>Merci de votre intérêt pour la newsletter TechPlay !</p>
            <p>Cliquez sur le lien ci-dessous pour confirmer votre inscription :</p>
            <p><a href="${confirmUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
              Confirmer mon inscription
            </a></p>
            <p style="color:#888;font-size:12px">Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
          `,
          tags: ['newsletter', 'double-optin'],
        }).catch((e) => logError('[notifications/subscribe] email', e));
      }
    } catch (e) {
      logError('[notifications/subscribe] newsletter save', e);
    }
  }

  return NextResponse.json({ success: true });
}

export const POST = withRateLimit(handler, limiter);
