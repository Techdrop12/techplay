import { NextResponse } from 'next/server';
import { z } from 'zod';

import { parseJsonBody } from '@/lib/parseJsonBody';
import { createRateLimiter, withRateLimit } from '@/lib/rateLimit';

const BodySchema = z.object({
  email: z.string().email('Email invalide'),
});

const limiter = createRateLimiter({ id: 'reminder-inactifs', limit: 5, intervalMs: 60_000 });

export const dynamic = 'force-dynamic';

async function handler(req: Request) {
  const parsed = await parseJsonBody(req, BodySchema);
  if (parsed.response) return parsed.response;

  // Ici : automatiser relance avec Brevo ou autre (parsed.data.email)
  return NextResponse.json({ status: 'ok', message: 'Relance envoyée' });
}

export const POST = withRateLimit(handler, limiter);
