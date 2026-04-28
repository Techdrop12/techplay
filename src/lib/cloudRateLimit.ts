// src/lib/cloudRateLimit.ts
// Rate limiter distribué via Upstash Redis — fallback in-memory si env vars absentes.
// Usage :
//   const result = await cloudCheck(req, { id: 'checkout', limit: 15, windowSec: 60 });
//   if (!result.ok) return new Response('Too Many Requests', { status: 429 });

import { ipFromRequest } from '@/lib/rateLimit';

export type CloudRateLimitOpts = {
  /** Namespace unique par endpoint (ex: 'checkout', 'contact'). */
  id: string;
  /** Requêtes autorisées par fenêtre. */
  limit: number;
  /** Durée de la fenêtre en secondes. */
  windowSec: number;
};

export type CloudRateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

// ─── Fallback in-memory (dev / pas d'env Upstash) ─────────────────────────────

type FixedEntry = { count: number; resetAt: number };
const store = new Map<string, FixedEntry>();

function inMemoryCheck(key: string, opts: CloudRateLimitOpts): CloudRateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;

  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, opts.limit - entry.count);

  return {
    ok: entry.count <= opts.limit,
    limit: opts.limit,
    remaining,
    resetAt: entry.resetAt,
  };
}

// ─── Upstash Redis ─────────────────────────────────────────────────────────────

let _upstashReady: boolean | null = null;

function isUpstashConfigured(): boolean {
  if (_upstashReady !== null) return _upstashReady;
  _upstashReady = !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
  return _upstashReady;
}

async function upstashCheck(
  key: string,
  opts: CloudRateLimitOpts
): Promise<CloudRateLimitResult> {
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');

  const redis = Redis.fromEnv();
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(opts.limit, `${opts.windowSec} s`),
    prefix: `rl:${opts.id}`,
    analytics: false,
  });

  const { success, limit, remaining, reset } = await ratelimit.limit(key);

  return {
    ok: success,
    limit,
    remaining,
    resetAt: reset,
  };
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Vérifie le rate limit pour la requête.
 * Utilise Upstash Redis si configuré, sinon retombe sur in-memory.
 */
export async function cloudCheck(
  req: Request,
  opts: CloudRateLimitOpts,
  customKey?: string
): Promise<CloudRateLimitResult> {
  const key = customKey ?? `${opts.id}:${ipFromRequest(req)}`;

  if (isUpstashConfigured()) {
    try {
      return await upstashCheck(key, opts);
    } catch {
      // Si Upstash échoue (réseau, quota…), on ne bloque pas l'utilisateur
      return { ok: true, limit: opts.limit, remaining: opts.limit, resetAt: Date.now() + opts.windowSec * 1000 };
    }
  }

  return inMemoryCheck(key, opts);
}

/**
 * Retourne les en-têtes standard RateLimit à ajouter à la Response.
 */
export function rateLimitHeaders(result: CloudRateLimitResult): Record<string, string> {
  const secondsUntilReset = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
    ...(result.ok ? {} : { 'Retry-After': String(Math.max(1, secondsUntilReset)) }),
  };
}
