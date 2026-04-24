import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import ReviewModel from '@/models/Review';
import { requireAdmin } from '@/lib/requireAdmin';

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const { reviewId, reply } = await req.json();
    if (!reviewId) return apiError('reviewId requis', 400);

    await connectToDatabase();

    if (!reply || String(reply).trim() === '') {
      await ReviewModel.findByIdAndUpdate(reviewId, {
        $unset: { adminReply: '', adminRepliedAt: '' },
      });
      return apiSuccess({ deleted: true });
    }

    await ReviewModel.findByIdAndUpdate(reviewId, {
      adminReply: String(reply).trim(),
      adminRepliedAt: new Date(),
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    logError('[admin/reviews/reply]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
