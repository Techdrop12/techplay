// src/lib/rateLimit.ts
// 🛡️ Rate limiter in-memory (Node/Edge safe) — full option
// - Stratégies: "fixed-window" (perf) & "sliding-window" (plus juste)
// - En-têtes normalisés: RateLimit + X-RateLimit-* + Retry-After
// - Persistance HMR (globalThis) pour Next.js en dev
// - Helper middleware Next.js et extraction IP

export type RateLimitStrategy = 'fixed-window' | 'sliding-window';

export type RateLimitOptions = {
  /** ID unique pour séparer plusieurs limiteurs (ex: 'login', 'review'). */
  id?: string;
  /** Requêtes autorisées par fenêtre. */
  limit?: number;
  /** Taille de la fenêtre en millisecondes. */
  intervalMs?: number;
  /** Stratégie de limitation. */
  strategy?: RateLimitStrategy;
  /**
   * Nettoyage périodique pour sliding-window (ms).
   * Met 0 pour désactiver (non recommandé).
   */
  sweepIntervalMs?: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

export type RateEntryFixed = { count: number; resetAt: number };
export type RateEntrySliding = { hits: number[]; lastSweep: number };
type Entry = RateEntryFixed | RateEntrySliding;

export type Limiter = {
  check: (key: string, weight?: number) => RateLimitResult;
  get: (key: string) => Entry | undefined;
  reset: (key?: string) => void;
  headers: (res: RateLimitResult) => Record<string, string>;
};

type Store = Map<string, Entry>;

type GlobalWithRateLimitStore = typeof globalThis & {
  __RL__?: Record<string, Store>;
};

/* ------------------------------------------------------------------ */
/* Store global pour survivre au HMR (utile en dev Next.js)           */
/* ------------------------------------------------------------------ */
function getGlobalStore(id: string): Store {
  const g = globalThis as GlobalWithRateLimitStore;

  if (!g.__RL__) {
    g.__RL__ = {};
  }

  if (!g.__RL__[id]) {
    g.__RL__[id] = new Map<string, Entry>();
  }

  return g.__RL__[id];
}

/* ------------------------------------------------------------------ */
/* Implémentation                                                     */
/* ------------------------------------------------------------------ */
export function createRateLimiter(opts: RateLimitOptions = {}): Limiter {
  const {
    id = 'default',
    limit = 10,
    intervalMs = 60_000,
    strategy = 'fixed-window',
    sweepIntervalMs = 60_000,
  } = opts;

  const map = getGlobalStore(id);

  function now() {
    return Date.now();
  }

  function touchFixed(key: string): RateEntryFixed {
    const n = now();
    const cur = map.get(key);

    if (!cur || 'hits' in cur || n > cur.resetAt) {
      const entry: RateEntryFixed = { count: 0, resetAt: n + intervalMs };
      map.set(key, entry);
      return entry;
    }

    return cur;
  }

  function touchSliding(key: string): RateEntrySliding {
    const n = now();
    const cur = map.get(key);

    if (!cur || !('hits' in cur)) {
      const entry: RateEntrySliding = { hits: [], lastSweep: n };
      map.set(key, entry);
      return entry;
    }

    cur.hits = cur.hits.filter((t) => n - t < intervalMs);

    if (sweepIntervalMs > 0 && n - cur.lastSweep > sweepIntervalMs) {
      cur.lastSweep = n;
      cur.hits = cur.hits.filter((t) => n - t < intervalMs);
    }

    return cur;
  }

  function computeResult(used: number, resetAt: number): RateLimitResult {
    const n = now();
    const remaining = Math.max(0, limit - used);
    const ok = used <= limit;
    const retryAfter = ok ? 0 : Math.max(0, resetAt - n);

    return {
      ok,
      limit,
      remaining,
      resetAt,
      retryAfter,
    };
  }

  function check(key: string, weight = 1): RateLimitResult {
    const safeWeight = Math.max(1, Math.floor(weight) || 1);

    if (strategy === 'fixed-window') {
      const entry = touchFixed(key);
      entry.count += safeWeight;
      return computeResult(entry.count, entry.resetAt);
    }

    const entry = touchSliding(key);
    const n = now();

    for (let i = 0; i < safeWeight; i++) {
      entry.hits.push(n);
    }

    const oldest = entry.hits[0] ?? n;
    const resetAt = oldest + intervalMs;

    return computeResult(entry.hits.length, resetAt);
  }

  function get(key: string): Entry | undefined {
    return map.get(key);
  }

  function reset(key?: string) {
    if (key) {
      map.delete(key);
      return;
    }

    map.clear();
  }

  function headers(res: RateLimitResult): Record<string, string> {
    const secondsUntilReset = Math.ceil(Math.max(0, res.resetAt - now()) / 1000);

    return {
      RateLimit: `limit=${res.limit}, remaining=${res.remaining}, reset=${secondsUntilReset}`,
      'X-RateLimit-Limit': String(res.limit),
      'X-RateLimit-Remaining': String(res.remaining),
      'X-RateLimit-Reset': String(Math.floor(res.resetAt / 1000)),
      ...(res.ok ? {} : { 'Retry-After': String(Math.max(1, secondsUntilReset)) }),
    };
  }

  return { check, get, reset, headers };
}

/* ------------------------------------------------------------------ */
/* Helpers Next.js                                                    */
/* ------------------------------------------------------------------ */

type RequestWithOptionalIp = Request & {
  ip?: string;
};

/** Extraction d’IP robuste (Edge/Node) */
export function ipFromRequest(req: Request): string {
  const request = req as RequestWithOptionalIp;
  const headers = req.headers;

  const xfwd = headers.get('x-forwarded-for');
  const forwardedIp = xfwd?.split(',')[0]?.trim();

  return (
    forwardedIp ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('fly-client-ip') ||
    request.ip ||
    'unknown'
  );
}

/**
 * Middleware léger pour routes App Router.
 * Usage:
 *   const limiter = createRateLimiter({ id: 'review', limit: 5, intervalMs: 60_000 });
 *   export async function POST(req: Request) {
 *     const key = ipFromRequest(req);
 *     const rl = limiter.check(key);
 *     if (!rl.ok) return new Response('Too Many Requests', { status: 429, headers: limiter.headers(rl) });
 *     return new Response('OK', { headers: limiter.headers(rl) });
 *   }
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response> | Response,
  limiter: Limiter,
  getKey: (req: Request) => string = ipFromRequest,
  weight = 1
) {
  return async (req: Request) => {
    const key = getKey(req);
    const rl = limiter.check(key, weight);

    if (!rl.ok) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: limiter.headers(rl),
      });
    }

    const res = await handler(req);
    const hdrs = limiter.headers(rl);

    Object.entries(hdrs).forEach(([k, v]) => {
      res.headers.set(k, v);
    });

    return res;
  };
}
