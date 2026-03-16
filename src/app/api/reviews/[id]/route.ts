import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';
import { requireAdmin } from '@/lib/requireAdmin';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  if (!id) return apiError('ID manquant', 400);

  try {
    await connectToDatabase();
    const doc = await Review.findByIdAndDelete(id).exec();
    if (!doc) return apiError('Avis introuvable', 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    logError('[reviews/:id] DELETE', safeErrorForLog(e));
    return apiError('Erreur suppression', 500);
  }
}
