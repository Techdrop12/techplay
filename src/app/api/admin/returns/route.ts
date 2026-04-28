import { z } from 'zod';

import { apiError, apiJson, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import { requireAdmin } from '@/lib/requireAdmin';
import { checkAdminRateLimit } from '@/lib/adminRateLimit';
import Return from '@/models/Return';

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const rl = checkAdminRateLimit(req, 'read');
  if (rl) return rl;

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = 25;

    const filter = status ? { status } : {};
    const [returns, total] = await Promise.all([
      Return.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      Return.countDocuments(filter),
    ]);

    return apiJson({ returns, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    logError('[admin/returns GET]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}

export async function PATCH(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const rl = checkAdminRateLimit(req, 'write');
  if (rl) return rl;

  const body = await req.json().catch(() => ({})) as { id?: string; status?: string };
  const StatusSchema = z.object({
    id: z.string().min(1),
    status: z.enum(['pending', 'approved', 'refused', 'refunded']),
  });
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) return apiError('Données invalides', 400);

  try {
    await connectToDatabase();
    const updated = await Return.findByIdAndUpdate(
      parsed.data.id,
      { $set: { status: parsed.data.status } },
      { new: true, lean: true }
    ).exec();
    if (!updated) return apiError('Retour introuvable', 404);
    return apiSuccess(updated);
  } catch (e) {
    logError('[admin/returns PATCH]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
