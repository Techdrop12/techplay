import { NextResponse } from 'next/server';

import { error as logError } from '@/lib/logger';
import { connectToDatabase } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';
import { contactSchema } from '@/lib/zodSchemas';

const contactLimiter = createRateLimiter({
  id: 'contact',
  limit: 10,
  intervalMs: 60_000,
  strategy: 'fixed-window',
});

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export async function POST(req: Request) {
  const ip = ipFromRequest(req);
  const rl = contactLimiter.check(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: contactLimiter.headers(rl) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Body JSON invalide', 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      first?.message?.[0] ?? first?.email?.[0] ?? first?.name?.[0] ?? 'Données invalides';
    return apiError(message, 400);
  }

  const { name, email, message, consent, website } = parsed.data;

  // Honeypot rempli => on répond succès sans rien stocker pour ne pas aider les bots
  if (website && website.trim().length > 0) {
    return apiSuccess({ ok: true } as Record<string, unknown>);
  }

  try {
    await connectToDatabase();
    const doc = await ContactSubmission.create({
      name: name?.trim() || undefined,
      email: email.trim().toLowerCase(),
      message: message.trim(),
      consent: Boolean(consent),
    });
    return apiSuccess(toPlain({ ok: true, id: doc._id }) as Record<string, unknown>);
  } catch (e) {
    logError('[contact] POST', safeErrorForLog(e));
    return apiError("Erreur lors de l'envoi. Réessayez plus tard.", 500);
  }
}
