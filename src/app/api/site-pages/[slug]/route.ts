import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import SitePage from '@/models/SitePage';

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug?.trim()) return apiError('Slug manquant', 400);

  try {
    await connectToDatabase();
    const doc = await SitePage.findOne({ slug: slug.trim().toLowerCase() }).lean().exec();
    if (!doc) return apiError('Page non trouvée', 404);
    return apiSuccess(toPlain(doc) as Record<string, unknown>);
  } catch (e) {
    logError('[site-pages/:slug]', safeErrorForLog(e));
    return apiError('Erreur', 500);
  }
}
