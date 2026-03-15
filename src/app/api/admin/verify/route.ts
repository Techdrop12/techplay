import { isAdmin } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/apiResponse'

/**
 * Vérifie que l'utilisateur courant a les droits admin (session NextAuth, role admin).
 * Utilisé par le layout admin côté client pour éviter d'exposer un token en NEXT_PUBLIC_*.
 */
export async function GET() {
  const ok = await isAdmin()
  if (!ok) {
    return apiError('Unauthorized', 401)
  }
  return apiSuccess({ ok: true })
}
