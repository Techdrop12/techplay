import { apiSuccess } from '@/lib/apiResponse';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  return apiSuccess({
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    BREVO_API_KEY: !!process.env.BREVO_API_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    NODE_ENV: process.env.NODE_ENV ?? 'unknown',
    MAINTENANCE: process.env.MAINTENANCE ?? 'false',
  });
}
