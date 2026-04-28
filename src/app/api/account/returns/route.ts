import { z } from 'zod';

import { apiError, apiJson } from '@/lib/apiResponse';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import { safeErrorForLog } from '@/lib/apiResponse';
import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';
import Return from '@/models/Return';

export const dynamic = 'force-dynamic';

const returnsLimiter = createRateLimiter({
  id: 'account-returns',
  limit: 5,
  intervalMs: 60_000,
  strategy: 'fixed-window',
});

const CreateSchema = z.object({
  orderRef: z.string().min(3).max(100).trim(),
  reason: z.enum(['defective', 'wrong_item', 'changed_mind', 'damaged', 'other']),
  details: z.string().max(1000).trim().optional(),
  items: z
    .array(
      z.object({
        productName: z.string().max(200).trim(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .max(20)
    .optional(),
});

export async function GET() {
  const session = await getSession();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return apiError('Non connecté', 401);

  try {
    await connectToDatabase();
    const returns = await Return.find({ email })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
    return apiJson({ returns });
  } catch (err) {
    logError('[returns GET]', safeErrorForLog(err));
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return apiError('Non connecté', 401);

  const ip = ipFromRequest(req);
  const rl = returnsLimiter.check(ip);
  if (!rl.ok) return apiError('Trop de demandes', 429);

  const raw = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return apiError('Données invalides', 400, { details: parsed.error.flatten().formErrors[0] });
  }

  const { orderRef, reason, details, items } = parsed.data;

  try {
    await connectToDatabase();

    // Limite : 1 demande par référence de commande
    const existing = await Return.findOne({ email, orderRef }).lean().exec();
    if (existing) return apiError('Une demande existe déjà pour cette commande', 409);

    const ret = await Return.create({ email, orderRef, reason, details, items, status: 'pending' });

    // Email de confirmation (non-bloquant)
    void sendReturnConfirmationEmail(email, orderRef).catch(() => null);

    return apiJson({ return: ret }, { status: 201 });
  } catch (err) {
    logError('[returns POST]', safeErrorForLog(err));
    return apiError('Erreur serveur', 500);
  }
}

async function sendReturnConfirmationEmail(email: string, orderRef: string): Promise<void> {
  try {
    await fetch(`${process.env.NEXTAUTH_URL ?? ''}/api/email/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        type: 'return_request',
        orderRef,
      }),
    });
  } catch {
    // non-bloquant
  }
}
