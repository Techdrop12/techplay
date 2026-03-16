import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { requireAdmin } from '@/lib/requireAdmin';

export async function DELETE(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return apiError('id manquant', 400);

  try {
    await dbConnect();
    const doc = await Blog.findByIdAndDelete(id).exec();
    if (!doc) return apiError('Article introuvable', 404);
    return apiSuccess({ ok: true });
  } catch (e) {
    logError('[blog/delete]', safeErrorForLog(e));
    return apiError('Erreur suppression', 500);
  }
}
