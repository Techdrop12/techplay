/**
 * Logger : en dev = console, en prod = no-op pour log/warn ; error utilise un message assaini.
 * Ne jamais logger de tokens, clés API, emails ou stack en production.
 */

import { safeErrorForLog } from '@/lib/apiResponse';

const isDev = process.env.NODE_ENV === 'development';

export function log(...args: unknown[]) {
  if (isDev) console.log(...args);
}

export function warn(...args: unknown[]) {
  if (isDev) console.warn(...args);
}

/**
 * En développement : log complet. En production : message assaini (redaction tokens/emails).
 */
export function error(...args: unknown[]) {
  if (isDev) {
    console.error(...args);
    return;
  }
  // Production : un seul message assaini pour éviter les fuites
  const msg = args.map((a) => (a instanceof Error ? safeErrorForLog(a) : String(a))).join(' ');
  if (msg) console.error('[error]', msg.slice(0, 500));
}
