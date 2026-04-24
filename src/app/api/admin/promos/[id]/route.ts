import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/requireAdmin';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();
    const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true }).lean().exec();
    if (!coupon) return apiError('Coupon introuvable', 404);
    return apiSuccess(coupon);
  } catch (e) {
    logError('[admin/promos PATCH]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const { id } = await params;
    await connectToDatabase();
    await Coupon.findByIdAndDelete(id).exec();
    return apiSuccess({ deleted: true });
  } catch (e) {
    logError('[admin/promos DELETE]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
