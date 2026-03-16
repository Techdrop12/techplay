/**
 * Centralized error message extraction for API routes and components.
 */

export function getErrorMessage(error: unknown): string {
  if (error == null) return '';
  if (error instanceof Error) return error.message ?? '';
  if (typeof error === 'string') return error.trim();
  // Zod: first issue message (optional dependency, check by shape)
  const z = error as { name?: string; issues?: Array<{ message?: string }> };
  if (z?.name === 'ZodError' && Array.isArray(z.issues) && z.issues[0]?.message)
    return z.issues[0].message;
  try {
    const s = JSON.stringify(error);
    return s.length > 0 ? s : '';
  } catch {
    return String(error);
  }
}

export function getErrorMessageWithFallback(error: unknown, fallback: string): string {
  const msg = getErrorMessage(error);
  return typeof msg === 'string' && msg.trim().length > 0 ? msg : fallback;
}
