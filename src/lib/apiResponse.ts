/**
 * Réponses API standardisées et sécurisées (production-ready).
 * - Format JSON homogène
 * - Pas d’exposition de détails internes en production
 * - Headers Cache-Control no-store pour les réponses sensibles
 */

import { NextResponse } from 'next/server';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export interface ApiErrorBody {
  error: string;
  /** Uniquement en développement */
  details?: string;
}

export interface ApiSuccessBody<T = unknown> {
  [key: string]: T | unknown;
}

/**
 * Réponse JSON avec Cache-Control no-store (à utiliser pour les routes API sensibles).
 */
function json<T>(data: T, init?: ResponseInit): NextResponse<T> {
  const res = NextResponse.json(data, init);
  res.headers.set('Cache-Control', 'no-store, private, max-age=0');
  return res;
}

/**
 * Réponse d’erreur standardisée.
 * En production, `details` n’est jamais renvoyé (évite fuite stack / message interne).
 */
export function apiError(
  message: string,
  status: number,
  options?: { details?: string }
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    error: message,
  };
  if (!IS_PRODUCTION && options?.details) {
    body.details = options.details;
  }
  return json(body, { status });
}

/**
 * Réponse succès standardisée.
 */
export function apiSuccess<T>(
  data: ApiSuccessBody<T>,
  status = 200
): NextResponse<ApiSuccessBody<T>> {
  return json(data, { status });
}

/**
 * Message d’erreur sûr pour les logs (redaction des données sensibles).
 * À utiliser avant de passer un erreur à error() / logError.
 */
export function safeErrorForLog(err: unknown): string {
  if (err instanceof Error) {
    let msg = err.message ?? '';
    // Redaction de patterns courants (token, clé, email dans le message)
    msg = msg.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]');
    msg = msg.replace(/\b(?:sk|pk)_[a-zA-Z0-9_]+\b/g, '[STRIPE_KEY]');
    msg = msg.replace(/\bwhsec_[a-zA-Z0-9]+\b/g, '[WEBHOOK_SECRET]');
    msg = msg.replace(/\b(?:Bearer|token|api[_-]?key)\s*[^\s]+/gi, '[TOKEN]');
    if (msg.length > 500) msg = msg.slice(0, 500) + '…';
    return msg;
  }
  if (typeof err === 'string') {
    const s = err.slice(0, 500);
    return s.replace(/\b(?:sk|pk)_[a-zA-Z0-9_]+\b/g, '[STRIPE_KEY]');
  }
  return 'Unknown error';
}

export { json as apiJson };
