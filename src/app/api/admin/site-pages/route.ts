import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import SitePage from '@/models/SitePage';
import { requireAdmin } from '@/lib/requireAdmin';

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const slug = url.searchParams.get('slug')?.trim();

  try {
    await connectToDatabase();
    if (slug) {
      const doc = await SitePage.findOne({ slug }).lean().exec();
      if (!doc) return apiError('Page introuvable', 404);
      return apiSuccess(toPlain(doc) as Record<string, unknown>);
    }
    const docs = await SitePage.find({}).sort({ slug: 1 }).lean().exec();
    return apiSuccess(toPlain(docs) as Record<string, unknown>);
  } catch (e) {
    logError('[admin/site-pages]', safeErrorForLog(e));
    return apiError('Erreur', 500);
  }
}

export async function PUT(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  let body: { slug: string; title: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Body invalide', 400);
  }
  const slug = body?.slug?.trim();
  const title = body?.title?.trim();
  if (!slug || !title) return apiError('slug et title requis', 400);

  try {
    await connectToDatabase();
    const doc = await SitePage.findOneAndUpdate(
      { slug },
      { $set: { title, content: body?.content ?? '' } },
      { new: true, upsert: true }
    )
      .lean()
      .exec();
    return apiSuccess(toPlain(doc) as Record<string, unknown>);
  } catch (e) {
    logError('[admin/site-pages] PUT', safeErrorForLog(e));
    return apiError('Erreur', 500);
  }
}
