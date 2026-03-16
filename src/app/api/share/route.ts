import { NextResponse } from 'next/server';

import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';

const MAX_QUERY_LENGTH = 2000;

const shareLimiter = createRateLimiter({
  id: 'share',
  limit: 30,
  intervalMs: 60_000,
});

export async function POST(req: Request) {
  const key = ipFromRequest(req);
  const rl = shareLimiter.check(key);
  if (!rl.ok) {
    return new NextResponse('Trop de requêtes. Réessayez dans une minute.', {
      status: 429,
      headers: shareLimiter.headers(rl),
    });
  }

  const form = await req.formData();
  const rawUrl = String(form.get('url') ?? '').trim();
  const rawText = String(form.get('text') ?? '').trim();
  const rawTitle = String(form.get('title') ?? '').trim();
  const raw = rawUrl || rawText || rawTitle || '';
  const truncated = raw.length > MAX_QUERY_LENGTH ? raw.slice(0, MAX_QUERY_LENGTH) : raw;
  const q = encodeURIComponent(truncated);
  const base = new URL(req.url).origin;
  const res = NextResponse.redirect(new URL(`/products?q=${q}`, base));
  Object.entries(shareLimiter.headers(rl)).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
