import crypto from 'crypto';

import { getServerSession } from 'next-auth/next';

import { apiError, apiJson } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';
import { authOptions } from '@/lib/auth-options';
import Wishlist from '@/models/Wishlist';

export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({
  id: 'wishlist-share',
  limit: 5,
  intervalMs: 60_000,
  strategy: 'fixed-window',
});

export async function POST(req: Request) {
  const rl = limiter.check(ipFromRequest(req));
  if (!rl.ok) return apiError('Trop de tentatives', 429);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError('Non authentifié', 401);

  await connectToDatabase();

  const wishlist = await Wishlist.findOne({ email: session.user.email }).exec();
  if (!wishlist) return apiError('Wishlist introuvable', 404);

  if (!wishlist.shareToken) {
    wishlist.shareToken = crypto.randomUUID();
    await wishlist.save();
  }

  return apiJson({ token: wishlist.shareToken });
}

export async function DELETE(req: Request) {
  const rl = limiter.check(ipFromRequest(req));
  if (!rl.ok) return apiError('Trop de tentatives', 429);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError('Non authentifié', 401);

  await connectToDatabase();

  await Wishlist.findOneAndUpdate(
    { email: session.user.email },
    { $unset: { shareToken: '' } }
  ).exec();

  return apiJson({ revoked: true });
}
