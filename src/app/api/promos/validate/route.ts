import { z } from 'zod';

import { apiError, apiJson } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import { safeErrorForLog } from '@/lib/apiResponse';
import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';
import Coupon from '@/models/Coupon';

export const dynamic = 'force-dynamic';

const validateLimiter = createRateLimiter({
  id: 'promo-validate',
  limit: 10,
  intervalMs: 60_000,
  strategy: 'fixed-window',
});

const BodySchema = z.object({
  code: z
    .string()
    .min(1)
    .max(32)
    .transform((v) => v.trim().toUpperCase()),
  subtotal: z.number().nonnegative(),
});

export async function POST(req: Request) {
  const ip = ipFromRequest(req);
  const rl = validateLimiter.check(ip);
  if (!rl.ok) return apiError('Trop de tentatives', 429);

  const raw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return apiError('Données invalides', 400);

  const { code, subtotal } = parsed.data;

  try {
    await connectToDatabase();
    const coupon = await Coupon.findOne({ code, active: true }).lean().exec() as {
      code: string;
      type: 'percent' | 'fixed';
      value: number;
      minOrder: number;
      maxUses: number | null;
      usedCount: number;
      expiresAt: Date | null;
    } | null;

    if (!coupon) return apiError('Code promo invalide', 404);

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return apiError('Code promo expiré', 410);
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return apiError('Code promo épuisé', 410);
    }

    const minOrder = coupon.minOrder ?? 0;
    if (subtotal < minOrder) {
      return apiError(`Commande minimum requise : ${minOrder.toFixed(2)} €`, 422);
    }

    const discount =
      coupon.type === 'percent'
        ? Math.round((subtotal * coupon.value) / 100 * 100) / 100
        : Math.min(coupon.value, subtotal);

    return apiJson({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount * 100) / 100,
      finalTotal: Math.round(Math.max(0, subtotal - discount) * 100) / 100,
    });
  } catch (err) {
    logError('[promos/validate]', safeErrorForLog(err));
    return apiError('Erreur serveur', 500);
  }
}

export async function GET() {
  return apiError('Method Not Allowed', 405);
}
