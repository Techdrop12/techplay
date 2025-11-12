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
  ok: boolean;           // true = autorisé
  limit: number;         // ex: 10
  remaining: number;     // ex: 7
  resetAt: number;       // timestamp ms
  retryAfter: number;    // ms (0 si ok)
};

export type RateEntryFixed = { count: number; resetAt: number };
export type RateEntrySliding = { hits: number[]; lastSweep: number };
type Entry = RateEntryFixed | RateEntrySliding;

export type Limiter = {
  check: (key: string, weight?: number) => RateLimitResult;
  get: (key: string) => Entry | undefined;
  reset: (key?: string) => void;
  /** En-têtes HTTP standard à joindre à la réponse. */
  headers: (res: RateLimitResult) => Record<string, string>;
};

/* ------------------------------------------------------------------ */
/* Store global pour survivre au HMR (utile en dev Next.js)           */
/* ------------------------------------------------------------------ */
type Store = Map<string, Entry>;
function getGlobalStore(id: string): Store {
  const g = globalThis as any;
  g.__RL__ = g.__RL__ || {};
  g.__RL__[id] = g.__RL__[id] || new Map<string, Entry>();
  return g.__RL__[id] as Store;
}

/* ------------------------------------------------------------------ */
/* Implémentation                                                     */
/* ------------------------------------------------------------------ */
export function createRateLimiter(opts: RateLimitOptions = {}): Limiter {
  const {
    id = 'default',
    limit = 10,
    intervalMs = 60_000,
    strategy: strat = 'fixed-window',
    sweepIntervalMs = 60_000,
  } = opts;

  const map = getGlobalStore(id);

  function now() {
    return Date.now();
  }

  function touchFixed(key: string): RateEntryFixed {
    const n = now();
    const cur = map.get(key) as RateEntryFixed | undefined;
    if (!cur || n > cur.resetAt) {
      const entry: RateEntryFixed = { count: 0, resetAt: n + intervalMs };
      map.set(key, entry);
      return entry;
    }
    return cur;
  }

  function touchSliding(key: string): RateEntrySliding {
    const n = now();
    let e = map.get(key) as RateEntrySliding | undefined;
    if (!e) {
      e = { hits: [], lastSweep: n };
      map.set(key, e);
      return e;
    }
    // Purge des hits expirés (fenêtre glissante)
    e.hits = e.hits.filter((t) => n - t < intervalMs);
    if (sweepIntervalMs > 0 && n - e.lastSweep > sweepIntervalMs) {
      e.lastSweep = n;
      e.hits = e.hits.filter((t) => n - t < intervalMs);
    }
    return e;
  }

  function computeResult(used: number, rAt: number): RateLimitResult {
    const n = now();
    const remaining = Math.max(0, limit - used);
    const ok = used <= limit;
    const retryAfter = ok ? 0 : Math.max(0, rAt - n);
    return { ok, limit, remaining, resetAt: rAt, retryAfter };
  }

  function check(key: string, weight = 1): RateLimitResult {
    if (weight < 1) weight = 1;

    if (strat === 'fixed-window') {
      const e = touchFixed(key);
      e.count += weight;
      return computeResult(e.count, e.resetAt);
    }

    // sliding-window
    const e = touchSliding(key);
    const n = now();
    for (let i = 0; i < weight; i++) e.hits.push(n);
    // resetAt = fin de la fenêtre courante pour le plus ancien hit retenu
    const oldest = e.hits[0] ?? n;
    const resetAt = oldest + intervalMs;
    return computeResult(e.hits.length, resetAt);
  }

  function get(key: string): Entry | undefined {
    return map.get(key);
  }

  function reset(key?: string) {
    if (key) map.delete(key);
    else map.clear();
  }

  function headers(res: RateLimitResult): Record<string, string> {
    const sec = Math.ceil(Math.max(0, res.resetAt - now()) / 1000);
    return {
      // RFC RateLimit (https://www.rfc-editor.org/rfc/rfc9239)
      'RateLimit': `limit=${res.limit}, remaining=${res.remaining}, reset=${sec}`,
      // De facto (compat GitHub/Heroku…)
      'X-RateLimit-Limit': String(res.limit),
      'X-RateLimit-Remaining': String(res.remaining),
      'X-RateLimit-Reset': String(Math.floor(res.resetAt / 1000)),
      ...(res.ok ? {} : { 'Retry-After': String(Math.max(1, sec)) }),
    };
  }

  return { check, get, reset, headers };
}

/* ------------------------------------------------------------------ */
/* Helpers Next.js                                                    */
/* ------------------------------------------------------------------ */

/** Extraction d’IP robuste (Edge/Node) */
export function ipFromRequest(req: Request): string {
  // @ts-ignore — compat Node/Edge
  const h: Headers = (req as any).headers || new Headers();
  const xfwd = h.get('x-forwarded-for');
  const xip =
    xfwd?.split(',')[0]?.trim() ||
    h.get('cf-connecting-ip') ||
    h.get('x-real-ip') ||
    h.get('fly-client-ip') ||
    // @ts-ignore Node
    (req as any).ip ||
    'unknown';
  return xip;
}

/**
 * Middleware léger pour routes App Router.
 * Usage:
 *   const limiter = createRateLimiter({ id: 'review', limit: 5, intervalMs: 60_000 });
 *   export async function POST(req: Request) {
 *     const key = ipFromRequest(req);
 *     const rl = limiter.check(key);
 *     if (!rl.ok) return new Response('Too Many Requests', { status: 429, headers: limiter.headers(rl) });
 *     // ... handler
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
      return new Response('Too Many Requests', { status: 429, headers: limiter.headers(rl) });
    }
    const res = await handler(req);
    const hdrs = limiter.headers(rl);
    // Merge headers proprement
    Object.entries(hdrs).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  };
}
