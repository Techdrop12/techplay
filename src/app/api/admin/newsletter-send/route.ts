import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { sendBrevoEmail } from '@/lib/email/sendBrevo';
import { requireAdmin } from '@/lib/requireAdmin';

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const { subject, html, testEmail } = await req.json();
    if (!subject || !html) return apiError('subject et html requis', 400);

    await connectToDatabase();

    if (testEmail) {
      await sendBrevoEmail({ to: testEmail, subject, html });
      return apiSuccess({ sent: 1, test: true });
    }

    const subscribers = await NewsletterSubscriber.find({}).select('email').lean().exec();
    if (!subscribers.length) return apiSuccess({ sent: 0 });

    const emails = subscribers.map((s) => s.email).filter(Boolean) as string[];

    let sent = 0;
    const BATCH = 50;
    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      const results = await Promise.allSettled(batch.map((to) => sendBrevoEmail({ to, subject, html })));
      sent += results.filter((r) => r.status === 'fulfilled').length;
    }

    return apiSuccess({ sent });
  } catch (e) {
    logError('[admin/newsletter-send]', safeErrorForLog(e));
    return apiError('Erreur envoi', 500);
  }
}
