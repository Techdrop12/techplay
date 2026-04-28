import { z } from 'zod';

import { apiError, apiJson } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  token: z.string().min(8).max(128),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ token: url.searchParams.get('token') });
  if (!parsed.success) return apiError('Token invalide', 400);

  const { token } = parsed.data;

  try {
    await connectToDatabase();

    const doc = await NewsletterSubscriber.findOneAndUpdate(
      { confirmToken: token, confirmed: false },
      {
        $set: { confirmed: true, confirmedAt: new Date() },
        $unset: { confirmToken: '' },
      },
      { new: true }
    ).exec();

    if (!doc) {
      // Already confirmed or token invalid
      const already = await NewsletterSubscriber.exists({ confirmed: true, confirmToken: null }).exec();
      if (already) return apiJson({ status: 'already_confirmed' });
      return apiError('Token invalide ou expiré', 404);
    }

    return apiJson({ status: 'confirmed', email: doc.email });
  } catch (e) {
    logError('[newsletter-confirm]', e);
    return apiError('Erreur serveur', 500);
  }
}
