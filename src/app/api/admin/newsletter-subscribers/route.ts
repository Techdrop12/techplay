import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { requireAdmin } from '@/lib/requireAdmin';

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit')) || 100));
  const skip = Math.max(0, Number(url.searchParams.get('skip')) || 0);

  try {
    await connectToDatabase();
    const [docs, total] = await Promise.all([
      NewsletterSubscriber.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      NewsletterSubscriber.countDocuments(),
    ]);
    return apiSuccess(toPlain({ items: docs, total }) as Record<string, unknown>);
  } catch (e) {
    logError('[admin/newsletter-subscribers]', e);
    return apiError('Erreur chargement', 500, { details: safeErrorForLog(e) });
  }
}
