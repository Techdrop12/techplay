import { error as logError } from '@/lib/logger';
import { apiError, apiJson, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';
import { requireAdmin } from '@/lib/requireAdmin';

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await connectToDatabase();
    const docs = await ContactSubmission.find({}).sort({ createdAt: -1 }).limit(200).lean().exec();
    return apiJson(toPlain(docs));
  } catch (e) {
    logError('[admin/contact-submissions]', e);
    return apiError('Erreur chargement messages', 500, { details: safeErrorForLog(e) });
  }
}
