/**
 * Comparaison timing-safe pour tokens / secrets (évite les attaques par timing).
 * À utiliser pour CRON_SECRET, ADMIN_REVALIDATE_TOKEN, etc.
 */

import crypto from 'crypto';

/**
 * Compare deux chaînes en temps constant (évite les attaques par timing).
 * Les deux doivent avoir la même longueur pour que la comparaison soit safe.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  if (bufA.length === 0) return true;
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Vérifie que le token fourni correspond au secret attendu (timing-safe).
 * Retourne false si l’un des deux est vide/undefined.
 */
export function verifySecret(
  provided: string | null | undefined,
  expected: string | null | undefined
): boolean {
  if (provided == null || expected == null) return false;
  const p = String(provided).trim();
  const e = String(expected).trim();
  if (p.length === 0 || e.length === 0) return false;
  return timingSafeEqual(p, e);
}
