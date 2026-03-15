import { getSession, isAdmin } from '@/lib/auth'
import { apiError } from '@/lib/apiResponse'

export async function requireAdmin() {
  const ok = await isAdmin()
  if (!ok) {
    return apiError('Unauthorized', 401)
  }
  return null
}

export async function getSessionOr401() {
  const session = await getSession()
  if (!session?.user) {
    return { response: apiError('Unauthorized', 401), session: null }
  }
  const ok = await isAdmin()
  if (!ok) {
    return { response: apiError('Forbidden', 403), session: null }
  }
  return { response: null, session }
}
