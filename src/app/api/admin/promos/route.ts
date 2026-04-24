import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/requireAdmin';
import { checkAdminRateLimit } from '@/lib/adminRateLimit';

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const rl = checkAdminRateLimit(req, 'read');
  if (rl) return rl;

  try {
    await connectToDatabase();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean().exec();
    return apiSuccess({ coupons });
  } catch (e) {
    logError('[admin/promos GET]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const rl = checkAdminRateLimit(req, 'write');
  if (rl) return rl;

  try {
    const body = await req.json();
    const { code, type, value, minOrder, maxUses, expiresAt } = body;
    if (!code || !type || value == null) return apiError('code, type et value requis', 400);
    if (!['percent', 'fixed'].includes(type)) return apiError('type invalide', 400);

    await connectToDatabase();
    const coupon = await Coupon.create({
      code: String(code).toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder ?? 0),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    return apiSuccess(coupon, 201);
  } catch (e: unknown) {
    if ((e as { code?: number })?.code === 11000) return apiError('Ce code existe déjà', 409);
    logError('[admin/promos POST]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
