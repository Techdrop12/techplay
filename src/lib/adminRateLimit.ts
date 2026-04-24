import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';
import { apiError } from '@/lib/apiResponse';

// Limites par catégorie d'action admin
const limiters = {
  read: createRateLimiter({ id: 'admin-read', limit: 300, intervalMs: 60_000 }),
  write: createRateLimiter({ id: 'admin-write', limit: 60, intervalMs: 60_000 }),
  export: createRateLimiter({ id: 'admin-export', limit: 10, intervalMs: 60_000 }),
  send: createRateLimiter({ id: 'admin-send', limit: 5, intervalMs: 300_000 }),
};

export type AdminRateLimitCategory = keyof typeof limiters;

export function checkAdminRateLimit(req: Request, category: AdminRateLimitCategory = 'read') {
  const key = ipFromRequest(req);
  const limiter = limiters[category];
  const result = limiter.check(key);
  if (!result.ok) {
    return apiError('Trop de requêtes, réessayez dans quelques instants.', 429);
  }
  return null;
}
