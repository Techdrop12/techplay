import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendEmail } from '@/lib/email';
import { getErrorMessage } from '@/lib/errors';
import { parseJsonBody } from '@/lib/parseJsonBody';
import { createRateLimiter, withRateLimit } from '@/lib/rateLimit';

const BodySchema = z.object({
  email: z.string().email('Email invalide'),
});

const limiter = createRateLimiter({ id: 'email-welcome', limit: 6, intervalMs: 60_000 });

export const dynamic = 'force-dynamic';

async function handler(req: Request) {
  const parsed = await parseJsonBody(req, BodySchema);
  if (parsed.response) return parsed.response;

  try {
    await sendEmail({
      to: parsed.data.email,
      subject: 'Bienvenue chez TechPlay 👋',
      html: `<h1>Merci pour votre inscription !</h1><p>Nous sommes ravis de vous compter parmi nous.</p>`,
    });
    return NextResponse.json({ status: 'sent' });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err) || 'Envoi impossible' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, limiter);
