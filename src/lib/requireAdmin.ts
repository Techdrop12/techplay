import { getSession, isAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiResponse';
import type { AppRole } from '@/lib/auth-options';

export async function requireAdmin() {
  return requireRole(['admin']);
}

export async function getSessionOr401() {
  const session = await getSession();
  if (!session?.user) {
    return { response: apiError('Unauthorized', 401), session: null };
  }
  const ok = await isAdmin();
  if (!ok) {
    return { response: apiError('Forbidden', 403), session: null };
  }
  return { response: null, session };
}

export async function requireRole(allowed: AppRole[]) {
  const session = await getSession();
  const role = (session?.user?.role ?? 'user') as AppRole;
  if (!allowed.includes(role)) {
    return apiError('Forbidden', 403);
  }
  return null;
}
